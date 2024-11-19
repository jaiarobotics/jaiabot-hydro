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

#include <goby/middleware/marshalling/protobuf.h>
// this space intentionally left blank
#include <goby/zeromq/application/single_thread.h>

#include "config.pb.h"
#include "jaiabot/groups.h"
#include "jaiabot/messages/jaia_dccl.pb.h"
#include "jaiabot/messages/mission.pb.h"

using goby::glog;
namespace si = boost::units::si;
using ApplicationBase = goby::zeromq::SingleThreadApplication<jaiabot::config::MissionRepeater>;

namespace jaiabot
{
namespace apps
{
class MissionRepeater : public ApplicationBase
{
  public:
    MissionRepeater();

  private:
    //    void loop() override;
    void run_script();

  private:
    bool script_run_{false};
};
} // namespace apps
} // namespace jaiabot

int main(int argc, char* argv[])
{
    return goby::run<jaiabot::apps::MissionRepeater>(
        goby::middleware::ProtobufConfigurator<jaiabot::config::MissionRepeater>(argc, argv));
}

jaiabot::apps::MissionRepeater::MissionRepeater()
{
    interprocess().subscribe<jaiabot::groups::mission_report>(
        [this](const protobuf::MissionReport& report)
        {
            glog.is_debug1() && glog << protobuf::MissionState_Name(report.state()) << std::endl;
            if (report.state() == protobuf::IN_MISSION__UNDERWAY__RECOVERY__TRANSIT)
            {
                if (!script_run_)
                    run_script();
            }
            else if (report.state() == protobuf::IN_MISSION__UNDERWAY__REPLAN)
            {
                script_run_ = false;
            }
        });
}

void jaiabot::apps::MissionRepeater::run_script()
{
    glog.is_verbose() && glog << "Start script" << std::endl;
    protobuf::Command command;
    command.set_bot_id(cfg().bot_id());
    command.set_time_with_units(goby::time::SystemClock::now<goby::time::MicroTime>());
    command.set_type(protobuf::Command::PAUSE);
    interprocess().publish<jaiabot::groups::self_command>(command);

    script_run_ = true;
}
