// Copyright 2021:
//   JaiaRobotics LLC
// File authors:
//   Toby Schneider <toby@gobysoft.org>
//
//
// This file is part of the JaiaBot Project Binaries
// ("The Jaia Binaries").
//
// The Jaia Binaries are free software: you can redistribute them and/or modify
// them under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 2 of the License, or
// (at your option) any later version.
//
// The Jaia Binaries are distributed in the hope that they will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with the Jaia Binaries.  If not, see <http://www.gnu.org/licenses/>.

#include <goby/middleware/marshalling/protobuf.h>
// this space intentionally left blank
#include <goby/middleware/frontseat/groups.h>
#include <goby/middleware/gpsd/groups.h>
#include <goby/middleware/protobuf/frontseat_data.pb.h>
#include <goby/middleware/protobuf/gpsd.pb.h>
#include <goby/util/seawater.h>

#include <goby/zeromq/application/single_thread.h>

#include "config.pb.h"
#include "jaiabot/groups.h"
#include "jaiabot/health/health.h"
#include "jaiabot/messages/arduino.pb.h"
#include "jaiabot/messages/control_surfaces.pb.h"
#include "jaiabot/messages/engineering.pb.h"
#include "jaiabot/messages/imu.pb.h"
#include "jaiabot/messages/jaia_dccl.pb.h"
#include "jaiabot/messages/mission.pb.h"
#include "jaiabot/messages/pressure_temperature.pb.h"
#include "jaiabot/messages/salinity.pb.h"
#include "wmm/WMM.h"
#include <cmath>
#include <math.h>
#define earthRadiusKm 6371.0

#define NOW (goby::time::SystemClock::now<goby::time::MicroTime>())

using goby::glog;
using namespace std;

namespace si = boost::units::si;
using boost::units::degree::degrees;
using ApplicationBase = goby::zeromq::SingleThreadApplication<jaiabot::config::Fusion>;

namespace jaiabot
{
namespace apps
{
class Fusion : public ApplicationBase
{
  public:
    Fusion();

  private:
    void init_node_status();
    void init_bot_status();

    void loop() override;
    void health(goby::middleware::protobuf::ThreadHealth& health) override;

    double deg2rad(const double& deg);
    double distanceToGoal(const double& lat1d, const double& lon1d, const double& lat2d,
                          const double& lon2d);
    boost::units::quantity<boost::units::degree::plane_angle>
    corrected_heading(const boost::units::quantity<boost::units::degree::plane_angle>& heading);
    void detect_imu_issue();
    double degrees_difference(const double& heading, const double& course);

  private:
    goby::middleware::frontseat::protobuf::NodeStatus latest_node_status_;
    jaiabot::protobuf::BotStatus latest_bot_status_;
    goby::time::SteadyClock::time_point last_health_report_time_{std::chrono::seconds(0)};
    std::set<jaiabot::protobuf::MissionState> discard_location_states_;
    std::set<jaiabot::protobuf::MissionState> include_course_error_detection_states_;
    std::set<jaiabot::protobuf::MissionState> include_imu_detection_states_;
    // timeout in seconds
    int course_over_ground_timeout_{0};
    double previous_course_over_ground_{0};
    bool imu_issue_{false};
    int imu_issue_crs_hdg_incr_{1};
    int imu_issue_hdg_incr_{1};
    goby::time::SteadyClock::time_point last_imu_issue_report_time_{std::chrono::seconds(0)};

    enum class DataType
    {
        GPS_FIX,
        GPS_POSITION,
        PRESSURE,
        TEMPERATURE,
        HEADING,
        SPEED,
        COURSE,
        PITCH,
        ROLL,
        CALIBRATION_SYS,
        CALIBRATION_GYRO,
        CALIBRATION_ACCEL,
        CALIBRATION_MAG
    };
    std::map<DataType, goby::time::SteadyClock::time_point> last_data_time_;
    //std::map<DataType, int> last_calibration_status_;

    const std::map<DataType, jaiabot::protobuf::Error> missing_data_errors_{
        {DataType::GPS_FIX, protobuf::ERROR__MISSING_DATA__GPS_FIX},
        {DataType::GPS_POSITION, protobuf::ERROR__MISSING_DATA__GPS_POSITION},
        {DataType::PRESSURE, protobuf::ERROR__MISSING_DATA__PRESSURE},
        {DataType::HEADING, protobuf::ERROR__MISSING_DATA__HEADING},
        {DataType::SPEED, protobuf::ERROR__MISSING_DATA__SPEED}};
    //    {DataType::CALIBRATION_SYS, protobuf::ERROR__MISSING_DATA__CALIBRATION_SYS},
    //    {DataType::CALIBRATION_GYRO, protobuf::ERROR__MISSING_DATA__CALIBRATION_GYRO},
    //    {DataType::CALIBRATION_ACCEL, protobuf::ERROR__MISSING_DATA__CALIBRATION_ACCEL},
    //    {DataType::CALIBRATION_MAG, protobuf::ERROR__MISSING_DATA__CALIBRATION_MAG}};
    const std::map<DataType, jaiabot::protobuf::Warning> missing_data_warnings_{
        {DataType::TEMPERATURE, protobuf::WARNING__MISSING_DATA__TEMPERATURE},
        {DataType::PITCH, protobuf::WARNING__MISSING_DATA__PITCH},
        {DataType::COURSE, protobuf::WARNING__MISSING_DATA__COURSE},
        {DataType::ROLL, protobuf::WARNING__MISSING_DATA__ROLL}};
    //const std::map<DataType, jaiabot::protobuf::Error> not_calibrated_errors_{
    //    {DataType::CALIBRATION_GYRO, protobuf::ERROR__NOT_CALIBRATED_GYRO},
    //    {DataType::CALIBRATION_ACCEL, protobuf::ERROR__NOT_CALIBRATED_ACCEL},
    //    {DataType::CALIBRATION_MAG, protobuf::ERROR__NOT_CALIBRATED_MAG}};
    //const std::map<DataType, jaiabot::protobuf::Warning> not_calibrated_warnings_{
    //    {DataType::CALIBRATION_SYS, protobuf::WARNING__NOT_CALIBRATED_SYS}};

    WMM wmm;
};
} // namespace apps
} // namespace jaiabot

int main(int argc, char* argv[])
{
    return goby::run<jaiabot::apps::Fusion>(
        goby::middleware::ProtobufConfigurator<jaiabot::config::Fusion>(argc, argv));
}

jaiabot::apps::Fusion::Fusion() : ApplicationBase(2 * si::hertz)
{
    init_node_status();
    init_bot_status();

    // Create a set of states. when the bot is in
    // one of these modes we should discard the
    // location status
    for (auto m : cfg().discard_location_states())
    {
        auto dsm = static_cast<jaiabot::protobuf::MissionState>(m);
        discard_location_states_.insert(dsm);
    }

    // Create a set of states. when the bot is in
    // one of these modes we should include the
    // course status
    for (auto m : cfg().include_course_error_detection_states())
    {
        auto dsm = static_cast<jaiabot::protobuf::MissionState>(m);
        include_course_error_detection_states_.insert(dsm);
    }

    // Create a set of states. when the bot is in
    // one of these modes we should detect
    // imu issue
    for (auto m : cfg().include_imu_detection_states())
    {
        auto dsm = static_cast<jaiabot::protobuf::MissionState>(m);
        include_imu_detection_states_.insert(dsm);
    }

    interprocess().subscribe<goby::middleware::groups::gpsd::att>(
        [this](const goby::middleware::protobuf::gpsd::Attitude& att) {
            glog.is_debug1() && glog << "Received Attitude update: " << att.ShortDebugString()
                                     << std::endl;

            auto now = goby::time::SteadyClock::now();

            if (att.has_pitch())
            {
                auto pitch = att.pitch_with_units();
                latest_node_status_.mutable_pose()->set_pitch_with_units(pitch);
                latest_bot_status_.mutable_attitude()->set_pitch_with_units(pitch);

                last_data_time_[DataType::PITCH] = now;
            }

            if (att.has_heading())
            {
                auto magneticDeclination = wmm.magneticDeclination(
                    latest_node_status_.global_fix().lon(), latest_node_status_.global_fix().lat());
                glog.is_debug2() &&
                    glog << "Location: " << latest_node_status_.global_fix().ShortDebugString()
                         << "  Magnetic declination: " << magneticDeclination << endl;
                auto heading = att.heading_with_units() + magneticDeclination * degrees;

                heading = corrected_heading(heading);

                latest_node_status_.mutable_pose()->set_heading_with_units(heading);
                latest_bot_status_.mutable_attitude()->set_heading_with_units(heading);

                last_data_time_[DataType::HEADING] = now;
            }

            if (att.has_roll())
            {
                auto roll = att.roll_with_units();
                latest_node_status_.mutable_pose()->set_roll_with_units(roll);
                latest_bot_status_.mutable_attitude()->set_roll_with_units(roll);

                last_data_time_[DataType::ROLL] = now;
            }
        });

    interprocess().subscribe<groups::imu>([this](const jaiabot::protobuf::IMUData& imu_data) {
        glog.is_debug1() && glog << "Received Attitude update from IMU: "
                                 << imu_data.ShortDebugString() << std::endl;

        auto euler_angles = imu_data.euler_angles();
        auto calibration_status = imu_data.calibration_status();
        auto now = goby::time::SteadyClock::now();

        if (euler_angles.has_alpha())
        {
            // IMU is offset by 270 degrees, so we need to rotate it
            auto heading = euler_angles.alpha_with_units() + 270 * degrees;

            // Apply magnetic declination
            auto magneticDeclination = wmm.magneticDeclination(
                latest_node_status_.global_fix().lon(), latest_node_status_.global_fix().lat());
            glog.is_debug2() &&
                glog << "Location: " << latest_node_status_.global_fix().ShortDebugString()
                     << "  Magnetic declination: " << magneticDeclination << endl;
            heading = heading + magneticDeclination * degrees;

            heading = corrected_heading(heading);

            latest_node_status_.mutable_pose()->set_heading_with_units(heading);
            latest_bot_status_.mutable_attitude()->set_heading_with_units(heading);

            last_data_time_[DataType::HEADING] = now;
        }

        if (euler_angles.has_gamma())
        {
            auto pitch = euler_angles.gamma_with_units();
            latest_node_status_.mutable_pose()->set_pitch_with_units(pitch);
            latest_bot_status_.mutable_attitude()->set_pitch_with_units(pitch);

            last_data_time_[DataType::PITCH] = now;
        }

        if (euler_angles.has_beta())
        {
            auto roll = euler_angles.beta_with_units();
            latest_node_status_.mutable_pose()->set_roll_with_units(roll);
            latest_bot_status_.mutable_attitude()->set_roll_with_units(roll);

            last_data_time_[DataType::ROLL] = now;
        }

        if (calibration_status.has_sys())
        {
            latest_bot_status_.mutable_calibration_status()->set_sys(calibration_status.sys());

            //last_calibration_status_[DataType::CALIBRATION_SYS] = calibration_status.sys();
            //last_data_time_[DataType::CALIBRATION_SYS] = now;
        }

        if (calibration_status.has_gyro())
        {
            latest_bot_status_.mutable_calibration_status()->set_gyro(calibration_status.gyro());

            //last_calibration_status_[DataType::CALIBRATION_GYRO] = calibration_status.gyro();
            //last_data_time_[DataType::CALIBRATION_GYRO] = now;
        }

        if (calibration_status.has_accel())
        {
            latest_bot_status_.mutable_calibration_status()->set_accel(calibration_status.accel());

            //last_calibration_status_[DataType::CALIBRATION_ACCEL] = calibration_status.accel();
            //last_data_time_[DataType::CALIBRATION_ACCEL] = now;
        }

        if (calibration_status.has_mag())
        {
            latest_bot_status_.mutable_calibration_status()->set_mag(calibration_status.mag());

            //last_calibration_status_[DataType::CALIBRATION_MAG] = calibration_status.mag();
            //last_data_time_[DataType::CALIBRATION_MAG] = now;
        }
        
    });
    interprocess().subscribe<goby::middleware::groups::gpsd::tpv>(
        [this](const goby::middleware::protobuf::gpsd::TimePositionVelocity& tpv) {
            glog.is_debug1() && glog << "Received TimePositionVelocity update: "
                                     << tpv.ShortDebugString() << std::endl;

            auto now = goby::time::SteadyClock::now();

            if (tpv.has_mode() &&
                (tpv.mode() == goby::middleware::protobuf::gpsd::TimePositionVelocity::Mode2D ||
                 tpv.mode() == goby::middleware::protobuf::gpsd::TimePositionVelocity::Mode3D))
            {
                last_data_time_[DataType::GPS_FIX] = now;
            }

            if (tpv.has_location())
            {
                glog.is_debug1() && glog << "Mission State:  " << latest_bot_status_.mission_state()
                                         << std::endl;
                // only set location if the current mode is not included in discard_status_modes_
                if (!discard_location_states_.count(latest_bot_status_.mission_state()))
                {

                    glog.is_debug1() && glog << "Updating Lat Long because bot is in the correct state:  "
                                             << latest_bot_status_.mission_state() << std::endl;
                                             
                    auto lat = tpv.location().lat_with_units(),
                         lon = tpv.location().lon_with_units();
                    latest_node_status_.mutable_global_fix()->set_lat_with_units(lat);
                    latest_node_status_.mutable_global_fix()->set_lon_with_units(lon);

                    latest_bot_status_.mutable_location()->set_lat_with_units(lat);
                    latest_bot_status_.mutable_location()->set_lon_with_units(lon);

                    if (has_geodesy())
                    {
                        auto xy =
                            geodesy().convert({latest_node_status_.global_fix().lat_with_units(),
                                               latest_node_status_.global_fix().lon_with_units()});
                        latest_node_status_.mutable_local_fix()->set_x_with_units(xy.x);
                        latest_node_status_.mutable_local_fix()->set_y_with_units(xy.y);
                    }
                }
                last_data_time_[DataType::GPS_POSITION] = now;
            }

            if (tpv.has_speed())
            {
                auto speed = tpv.speed_with_units();
                latest_node_status_.mutable_speed()->set_over_ground_with_units(speed);
                latest_bot_status_.mutable_speed()->set_over_ground_with_units(speed);
                last_data_time_[DataType::SPEED] = now;
            }

            if (tpv.has_track())
            {
                auto track = tpv.track_with_units();
                latest_node_status_.mutable_pose()->set_course_over_ground_with_units(track);
                latest_bot_status_.mutable_attitude()->set_course_over_ground_with_units(track);
                last_data_time_[DataType::COURSE] = now;
            }

            if (!include_course_error_detection_states_.count(latest_bot_status_.mission_state()))
            {
                // Update course timestamp
                // We want to ignore errors until we are
                // in the right state
                last_data_time_[DataType::COURSE] = now;
            }

            // publish the latest status message with each GPS update
            if (tpv.has_time())
            {
                auto time = tpv.time_with_units();
                latest_node_status_.set_time_with_units(time);
            }
            else
            {
                auto time = goby::time::SystemClock::now<goby::time::MicroTime>();
                latest_node_status_.set_time_with_units(time);
            }

            if (latest_node_status_.IsInitialized())
            {
                interprocess().publish<goby::middleware::frontseat::groups::node_status>(
                    latest_node_status_);
            }
        });

    interprocess().subscribe<jaiabot::groups::pressure_temperature>(
        [this](const jaiabot::protobuf::PressureTemperatureData& pt) {
            auto now = goby::time::SteadyClock::now();

            auto depth = goby::util::seawater::depth(
                pt.pressure_with_units(), latest_node_status_.global_fix().lat_with_units());

            latest_node_status_.mutable_global_fix()->set_depth_with_units(depth);
            latest_node_status_.mutable_local_fix()->set_z_with_units(
                -latest_node_status_.global_fix().depth_with_units());
            latest_bot_status_.set_depth_with_units(depth);
            last_data_time_[DataType::PRESSURE] = now;

            if (pt.has_temperature())
            {
                latest_bot_status_.set_temperature_with_units(pt.temperature_with_units());
                last_data_time_[DataType::TEMPERATURE] = now;
            }
        });

    interprocess().subscribe<jaiabot::groups::arduino_to_pi>(
        [this](const jaiabot::protobuf::ArduinoResponse& arduino_response) {
            if (arduino_response.has_thermocouple_temperature_c())
            {
                latest_bot_status_.set_thermocouple_temperature(
                    arduino_response.thermocouple_temperature_c());
            }

            //takes data from one message to the next (clarified by different names)
            if (arduino_response.has_vccvoltage())
            {
                latest_bot_status_.set_vcc_voltage(arduino_response.vccvoltage());
            }

            if (arduino_response.has_vcccurrent())
            {
                latest_bot_status_.set_vcc_current(arduino_response.vcccurrent());
            }

            if (arduino_response.has_vvcurrent())
            {
                latest_bot_status_.set_vv_current(arduino_response.vvcurrent());
            }
        });

    interprocess().subscribe<jaiabot::groups::mission_report>(
        [this](const protobuf::MissionReport& report) {
            latest_bot_status_.set_mission_state(report.state());
            if (report.has_active_goal())
                latest_bot_status_.set_active_goal(report.active_goal());
            else
                latest_bot_status_.clear_active_goal();
            if (report.has_active_goal_location())
            {
                if (latest_bot_status_.has_location())
                {
                    if (latest_bot_status_.location().has_lat() &&
                        latest_bot_status_.location().has_lon())
                    {
                        double distance = distanceToGoal(report.active_goal_location().lat(),
                                                         report.active_goal_location().lon(),
                                                         latest_bot_status_.location().lat(),
                                                         latest_bot_status_.location().lon());
                        // Set distance in meters
                        distance = distance * (1000);
                        latest_bot_status_.set_distance_to_active_goal(distance);
                    }
                }
            }
            else
            {
                latest_bot_status_.clear_distance_to_active_goal();
            }
        });

    interprocess().subscribe<jaiabot::groups::salinity>(
        [this](const jaiabot::protobuf::SalinityData& salinityData) {
            glog.is_debug1() && glog << "=> " << salinityData.ShortDebugString() << std::endl;
            latest_bot_status_.set_salinity(salinityData.salinity());
        });

    interprocess().subscribe<goby::middleware::groups::health_report>(
        [this](const goby::middleware::protobuf::VehicleHealth& vehicle_health) {
            last_health_report_time_ = goby::time::SteadyClock::now();
            jaiabot::health::populate_status_from_health(latest_bot_status_, vehicle_health);
        });

    // subscribe for commands, to set last_command_time
    interprocess().subscribe<jaiabot::groups::engineering_command>(
        [this](const jaiabot::protobuf::Engineering& command) {
            glog.is_debug1() && glog << "=> " << command.ShortDebugString() << std::endl;

            latest_bot_status_.set_last_command_time_with_units(command.time_with_units());
        });

    interprocess().subscribe<goby::middleware::groups::gpsd::sky>(
        [this](const goby::middleware::protobuf::gpsd::SkyView& sky) {
            if (sky.has_hdop())
            {
                latest_bot_status_.set_hdop(sky.hdop());
            }
            if (sky.has_pdop())
            {
                latest_bot_status_.set_pdop(sky.pdop());
            }
        });
}

void jaiabot::apps::Fusion::init_node_status()
{
    // set empty pose field so NodeStatus gets generated even without pitch, heading, or roll data
    latest_node_status_.mutable_pose();
}

void jaiabot::apps::Fusion::init_bot_status() { latest_bot_status_.set_bot_id(cfg().bot_id()); }

void jaiabot::apps::Fusion::loop()
{
    // DCCL uses the real system clock to encode time, so "unwarp" the time first
    auto unwarped_time = goby::time::convert<goby::time::MicroTime>(
        goby::time::SystemClock::unwarp(goby::time::SystemClock::now()));

    latest_bot_status_.set_time_with_units(unwarped_time);

    if (last_health_report_time_ + std::chrono::seconds(cfg().health_report_timeout_seconds()) <
        goby::time::SteadyClock::now())
    {
        glog.is_warn() && glog << "Timeout on health report" << std::endl;
        latest_bot_status_.set_health_state(goby::middleware::protobuf::HEALTH__FAILED);
        latest_bot_status_.clear_error();
        latest_bot_status_.add_error(protobuf::ERROR__NOT_RESPONDING__JAIABOT_HEALTH);
    }
    else
    {
        // If the imu issue is currently not detected and we are not running a sim
        if (!imu_issue_ && !cfg().is_sim())
        {
            // only detect imu issue if the current mode is included in include_imu_detection_modes_
            if (include_imu_detection_states_.count(latest_bot_status_.mission_state()))
            {
                //Let's detect imu issue
                detect_imu_issue();
            }
        }

        if ((last_imu_issue_report_time_ + std::chrono::seconds(cfg().imu_restart_timeout())) <
            goby::time::SteadyClock::now())
        {
            // Reset imu issue vars
            imu_issue_ = false;
        }
    }

    if (latest_bot_status_.IsInitialized())
    {
        glog.is_debug1() && glog << "Publishing bot status over intervehicle(): "
                                 << latest_bot_status_.ShortDebugString() << endl;
        intervehicle().publish<jaiabot::groups::bot_status>(latest_bot_status_);
    }
}

void jaiabot::apps::Fusion::health(goby::middleware::protobuf::ThreadHealth& health)
{
    health.ClearExtension(jaiabot::protobuf::jaiabot_thread);
    health.set_name(this->app_name());
    health.set_state(goby::middleware::protobuf::HEALTH__OK);

    // order matters - do warnings then errors so that the state ends up correct
    auto now = goby::time::SteadyClock::now();
    for (const auto& wp : missing_data_warnings_)
    {
        if (!last_data_time_.count(wp.first) ||
            (last_data_time_[wp.first] + std::chrono::seconds(cfg().data_timeout_seconds()) < now))
        {
            health.MutableExtension(jaiabot::protobuf::jaiabot_thread)->add_warning(wp.second);
            health.set_state(goby::middleware::protobuf::HEALTH__DEGRADED);
            glog.is_warn() && glog << jaiabot::protobuf::Warning_Name(wp.second) << std::endl;
        }
    }
    /*for (const auto& ep : not_calibrated_warnings_)
    {
        if (!last_calibration_status_.count(ep.first) || last_calibration_status_[ep.first] < 3)
        {
            health.MutableExtension(jaiabot::protobuf::jaiabot_thread)->add_warning(ep.second);
            health.set_state(goby::middleware::protobuf::HEALTH__DEGRADED);
            glog.is_warn() && glog << jaiabot::protobuf::Warning_Name(ep.second) << std::endl;
        }
    }*/
    if (imu_issue_)
    {
        health.MutableExtension(jaiabot::protobuf::jaiabot_thread)
            ->add_warning(protobuf::WARNING__IMU_ISSUE);
        health.set_state(goby::middleware::protobuf::HEALTH__DEGRADED);
        glog.is_warn() && glog << jaiabot::protobuf::Warning_Name(protobuf::WARNING__IMU_ISSUE)
                               << std::endl;
    }

    for (const auto& ep : missing_data_errors_)
    {
        if (!last_data_time_.count(ep.first) ||
            (last_data_time_[ep.first] + std::chrono::seconds(cfg().data_timeout_seconds()) < now))
        {
            health.MutableExtension(jaiabot::protobuf::jaiabot_thread)->add_error(ep.second);
            health.set_state(goby::middleware::protobuf::HEALTH__FAILED);
            glog.is_warn() && glog << jaiabot::protobuf::Error_Name(ep.second) << std::endl;
        }
    }
    /*for (const auto& ep : not_calibrated_errors_)
    {
        if (!last_calibration_status_.count(ep.first) || last_calibration_status_[ep.first] < 3)
        {
            health.MutableExtension(jaiabot::protobuf::jaiabot_thread)->add_error(ep.second);
            health.set_state(goby::middleware::protobuf::HEALTH__FAILED);
            glog.is_warn() && glog << jaiabot::protobuf::Error_Name(ep.second) << std::endl;
        }
    }*/
}

// This function converts decimal degrees to radians
double jaiabot::apps::Fusion::deg2rad(const double& deg) { return (deg * M_PI / 180); }

/**
 * Returns the distance between two points on the Earth.
 * Direct translation from http://en.wikipedia.org/wiki/Haversine_formula
 * @param lat1d Latitude of the first point in degrees
 * @param lon1d Longitude of the first point in degrees
 * @param lat2d Latitude of the second point in degrees
 * @param lon2d Longitude of the second point in degrees
 * @return The distance between the two points in kilometers
 */
double jaiabot::apps::Fusion::distanceToGoal(const double& lat1d, const double& lon1d,
                                             const double& lat2d, const double& lon2d)
{
    double lat1r, lon1r, lat2r, lon2r, u, v;
    lat1r = deg2rad(lat1d);
    lon1r = deg2rad(lon1d);
    lat2r = deg2rad(lat2d);
    lon2r = deg2rad(lon2d);
    u = sin((lat2r - lat1r) / 2);
    v = sin((lon2r - lon1r) / 2);
    return 2.0 * earthRadiusKm * asin(sqrt(u * u + cos(lat1r) * cos(lat2r) * v * v));
}

/**
 * @brief Correcting heading After addition of Magnetic Declination
 * 
 * @param heading Heading with Addition of Magnetic Declination
 * @return boost::units::quantity<boost::units::degree::plane_angle> Corrected Heading 
 */
boost::units::quantity<boost::units::degree::plane_angle> jaiabot::apps::Fusion::corrected_heading(
    const boost::units::quantity<boost::units::degree::plane_angle>& heading)
{
    auto corrected_heading = heading;
    if (heading < 0 * degrees)
        corrected_heading += 360 * degrees;
    if (heading > 360 * degrees)
        corrected_heading -= 360 * degrees;

    return corrected_heading;
}

/**
 * @brief We need to detect imu issues
 * 
 */
void jaiabot::apps::Fusion::detect_imu_issue()
{
    jaiabot::protobuf::IMUIssue imu_issue;
    imu_issue.set_solution(cfg().imu_issue_solution());

    auto now = goby::time::SteadyClock::now();

    glog.is_debug1() && glog << "detect_imu_issue" << endl;

    //Let's try to detect IMU issu
    //Check to see if we have heading and course info
    if (latest_bot_status_.has_attitude() && latest_bot_status_.attitude().has_heading() &&
        latest_bot_status_.attitude().has_course_over_ground())
    {
        double heading = latest_bot_status_.attitude().heading();
        double course = latest_bot_status_.attitude().course_over_ground();

        glog.is_debug1() &&
            glog << "Bot has heading and course over ground data"
                 << ", course last updated: "
                 << last_data_time_[DataType::COURSE].time_since_epoch().count()
                 << ", timout: " << std::chrono::seconds(cfg().course_over_ground_timeout()).count()
                 << ", current time: " << now.time_since_epoch().count() << endl;
        // Make sure Course is updating
        if (last_data_time_[DataType::COURSE] +
                std::chrono::seconds(cfg().course_over_ground_timeout()) >=
            now)
        {
            glog.is_debug1() && glog << "The course over ground value is updating"
                                     << ", Previous Course: " << previous_course_over_ground_
                                     << ", Current Course: " << course << endl;

            // Make sure course is updating with new value
            if (previous_course_over_ground_ != course)
            {
                // Set previous course
                previous_course_over_ground_ = course;

                double diff = degrees_difference(heading, course);

                glog.is_debug1() &&
                    glog << "The previous course is different than the current course"
                         << ", Difference between course and heading: " << diff
                         << ", Max Diff: " << cfg().imu_heading_course_max_diff() << endl;

                // Make sure the diff is greater than the config max
                if (diff >= cfg().imu_heading_course_max_diff())
                {
                    if (imu_issue_crs_hdg_incr_ < cfg().total_imu_issue_checks())
                    {
                        glog.is_debug1() && glog << "Have not reached threshold for total checks "
                                                 << imu_issue_crs_hdg_incr_ << " < "
                                                 << cfg().total_imu_issue_checks() << std::endl;
                        // Increment until we reach total_imu_issue_checks
                        imu_issue_crs_hdg_incr_++;
                    }
                    else
                    {
                        interprocess().publish<jaiabot::groups::imu>(imu_issue);
                        imu_issue_ = true;
                        glog.is_debug1() && glog << "Post IMU Warning" << endl;
                    }
                }
                else
                {
                    // Reset increment
                    imu_issue_crs_hdg_incr_ = 1;
                }
            }
            else
            {
                // Reset increment
                imu_issue_crs_hdg_incr_ = 1;
            }
        }
        else
        {
            // Reset increment
            imu_issue_crs_hdg_incr_ = 1;
        }
    }
    else
    {
        // Reset increment
        imu_issue_crs_hdg_incr_ = 1;
    }

    if (!last_data_time_.count(DataType::HEADING) ||
        (last_data_time_[DataType::HEADING] + std::chrono::seconds(cfg().data_timeout_seconds()) <
         now))
    {
        if (imu_issue_hdg_incr_ < cfg().total_imu_issue_checks())
        {
            glog.is_debug1() && glog << "Have not reached threshold for total checks "
                                     << imu_issue_hdg_incr_ << " < "
                                     << cfg().total_imu_issue_checks() << std::endl;
            // Increment until we reach total_imu_issue_checks
            imu_issue_hdg_incr_++;
        }
        else
        {
            interprocess().publish<jaiabot::groups::imu>(imu_issue);
            imu_issue_ = true;
            glog.is_debug1() && glog << "Post IMU Warning" << endl;
        }
        
    }
    else
    {
        // Reset increment 
        imu_issue_hdg_incr_ = 1;
    }

    if(imu_issue_)
    {
        last_imu_issue_report_time_ = now;
        // Reset hdg increment
        imu_issue_hdg_incr_ = 1;
        // Reset crs hdg increment
        imu_issue_crs_hdg_incr_ = 1;
    }
}

/**
 * @brief The difference between heading and course
 * 
 * @param heading double
 * @param course double
 * @return double 
 */
double jaiabot::apps::Fusion::degrees_difference(const double& heading, const double& course)
{
    double absDiff = std::abs(heading - course);

    if (absDiff <= 180)
    {
        return absDiff;
    }
    else
    {
        return 360 - absDiff;
    }
}