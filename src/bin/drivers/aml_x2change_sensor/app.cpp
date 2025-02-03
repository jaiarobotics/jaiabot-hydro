// Copyright 2025:
//   JaiaRobotics LLC
// File authors:
//   Matthew Ferro <matt.ferro@jaia.tech>
//
// This file is part of the JaiaBot Hydro Project Binaries
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

#include <numeric>

#include <goby/middleware/marshalling/protobuf.h>
// this space intentionally left blank
#include <boost/units/absolute.hpp>
#include <boost/units/io.hpp>
#include <dccl/codec.h>
#include <goby/util/constants.h>
#include <goby/zeromq/application/multi_thread.h>

#include "config.pb.h"
#include "jaiabot/groups.h"
#include "jaiabot/messages/health.pb.h"
#include "jaiabot/lora/serial.h"

using goby::glog;
namespace si = boost::units::si;
namespace config = jaiabot::config;
namespace groups = jaiabot::groups;
namespace zeromq = goby::zeromq;
namespace middleware = goby::middleware;

constexpr goby::middleware::Group serial_in{"aml_x2change::serial_in"};
constexpr goby::middleware::Group serial_out{"aml_x2change::serial_out"};

namespace jaiabot
{
namespace apps
{

class AMLX2ChangeSensorDriver
    : public zeromq::MultiThreadApplication<config::AMLX2ChangeSensorDriver>
{
  public:
    AMLX2ChangeSensorDriver();

  private:
    void loop() override;
    void health(goby::middleware::protobuf::ThreadHealth& health) override;
    void check_last_report(goby::middleware::protobuf::ThreadHealth& health,
                           goby::middleware::protobuf::HealthState& health_state);

  private:
    goby::time::SteadyClock::time_point last_aml_x2change_report_time_{std::chrono::seconds(0)};
};

} // namespace apps
} // namespace jaiabot

int main(int argc, char* argv[])
{
    return goby::run<jaiabot::apps::AMLX2ChangeSensorDriver>(
        goby::middleware::ProtobufConfigurator<config::AMLX2ChangeSensorDriver>(argc, argv));
}

jaiabot::apps::AMLX2ChangeSensorDriver::AMLX2ChangeSensorDriver()
    : zeromq::MultiThreadApplication<config::AMLX2ChangeSensorDriver>(1 * si::hertz)
{
    using SerialThread = jaiabot::lora::SerialThreadLoRaFeather<serial_in, serial_out>;
    launch_thread<SerialThread>(cfg().serial_aml_x2change());

    interthread().subscribe<serial_in>([this](const goby::middleware::protobuf::IOData& io) {
        try
        {
            glog.is_debug2() && glog << group("main") << io.DebugString() << std::endl;
        }
        catch (const std::exception& e)
        {
            glog.is_warn() && glog << group("arduino")
                                   << "AML X2Change Response Parsing Failed: Exception Was Caught: "
                                   << e.what() << std::endl;
        }
        catch (...)
        {
            glog.is_warn() && glog << group("arduino")
                                   << "AML X2Change Response Parsing Failed: Exception Was Caught!"
                                   << std::endl;
        }
    });
}

void jaiabot::apps::AMLX2ChangeSensorDriver::loop()
{
}

void jaiabot::apps::AMLX2ChangeSensorDriver::health(
    goby::middleware::protobuf::ThreadHealth& health)
{
    health.ClearExtension(jaiabot::protobuf::jaiabot_thread);
    health.set_name(this->app_name());
    auto health_state = goby::middleware::protobuf::HEALTH__OK;

    check_last_report(health, health_state);

    health.set_state(health_state);
}

void jaiabot::apps::AMLX2ChangeSensorDriver::check_last_report(
    goby::middleware::protobuf::ThreadHealth& health,
    goby::middleware::protobuf::HealthState& health_state)
{
    if (last_aml_x2change_report_time_ +
            std::chrono::seconds(cfg().aml_x2change_report_timeout_seconds()) <
        goby::time::SteadyClock::now())
    {
        glog.is_warn() && glog << "Timeout on AML X2Change sensor" << std::endl;
        health_state = goby::middleware::protobuf::HEALTH__DEGRADED;
        health.MutableExtension(jaiabot::protobuf::jaiabot_thread)
            ->add_warning(
                protobuf::WARNING__NOT_RESPONDING__JAIABOT_AML_X2CHANGE_SENSOR_DRIVER);
    }
}
