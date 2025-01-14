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

#ifndef JAIABOT_SRC_BIN_TOOL_ACTIONS_ADMIN_FLEET_CREATE_H
#define JAIABOT_SRC_BIN_TOOL_ACTIONS_ADMIN_FLEET_CREATE_H

#include "goby/middleware/application/interface.h"

#include "actions/admin/fleet/create.pb.h"

namespace jaiabot
{
namespace apps
{
namespace admin
{
namespace fleet
{
class CreateToolConfigurator
    : public goby::middleware::ProtobufConfigurator<jaiabot::config::admin::fleet::CreateTool>
{
  public:
    CreateToolConfigurator(int argc, char* argv[])
        : goby::middleware::ProtobufConfigurator<jaiabot::config::admin::fleet::CreateTool>(argc,
                                                                                            argv)
    {
        auto& cfg = mutable_cfg();
    }
};

class CreateTool : public goby::middleware::Application<jaiabot::config::admin::fleet::CreateTool>
{
  public:
    CreateTool();
    ~CreateTool() override {}

  private:
    void run() override { assert(false); }

  private:
};

} // namespace fleet
} // namespace admin
} // namespace apps
} // namespace jaiabot
#endif
