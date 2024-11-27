// Copyright 2024:
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

#include "atlas_scientific__ezo_ec.h"

#include "jaiabot/groups.h"
#include "jaiabot/messages/sensor/sensor_core.pb.h"

using goby::glog;

jaiabot::apps::AtlasScientificEZOECDriver::AtlasScientificEZOECDriver(
    const jaiabot::sensor::protobuf::Metadata& config)
    : goby::middleware::SimpleThread<jaiabot::sensor::protobuf::Metadata>(config)

{
    glog.add_group("ezo_ec", goby::util::Colors::blue);

    interthread().subscribe<jaiabot::groups::mcu_pb_data_in>(
        [this](const sensor::protobuf::SensorData& sensor_data)
        {
            if (sensor_data.has_ezo_ec())
                receive_data(sensor_data.ezo_ec());
        });

    // configure our sensor
    sensor::protobuf::SensorRequest request;
    auto& sensor_cfg = *request.mutable_cfg();
    sensor_cfg.set_sensor(config.sensor());

    // TODO - hardcode or configuration?
    sensor_cfg.set_sample_freq_with_units(10 * boost::units::si::hertz);
    interprocess().publish<jaiabot::groups::mcu_pb_data_out>(request);
}

void jaiabot::apps::AtlasScientificEZOECDriver::receive_data(
    const sensor::protobuf::AtlasScientificEZOEC& ec_data)
{
    glog.is_debug1() && glog << group("ezo_ec")
                             << "Received ec_data: " << ec_data.ShortDebugString() << std::endl;

    // TODO - add calibration and metadata ID, convert to standardized message, and publish over to QA thread
}
