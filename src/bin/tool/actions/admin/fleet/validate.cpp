#include <chrono>
#include <ctime>
#include <iomanip>
#include <iostream>
#include <sstream>
#include <string>

#include "jaiabot/messages/fleet_config.pb.h"

#include "../../common.h"
#include "config.pb.h"
#include "validate.h"

#include <boost/filesystem.hpp>
#include <google/protobuf/text_format.h>

#include <goby/middleware/application/tool.h>
#include <goby/util/debug_logger.h>

using goby::glog;

jaiabot::apps::admin::fleet::ValidateTool::ValidateTool()
{
    int exit_code = validate();
    quit(exit_code);
}

int jaiabot::apps::admin::fleet::ValidateTool::validate()
{
    jaiabot::protobuf::FleetConfig fleet_cfg;

    std::ifstream file(app_cfg().fleet_cfg());
    if (!file.is_open())
    {
        glog.is_die() && glog << "Failed to open file: " << app_cfg().fleet_cfg() << std::endl;
        return 1;
    }

    // Read the entire file into a string
    std::string file_content((std::istreambuf_iterator<char>(file)),
                             std::istreambuf_iterator<char>());

    // Parse the text format protobuf
    if (!google::protobuf::TextFormat::ParseFromString(file_content, &fleet_cfg))
    {
        glog.is_die() && glog << "Failed to parse protobuf text format from file: "
                              << app_cfg().fleet_cfg() << std::endl;
        return 1;
    }

    // Check if the message is fully initialized
    if (!fleet_cfg.IsInitialized())
    {
        glog.is_die() && glog << "Protobuf fleet_cfg is not fully initialized." << std::endl;
        return 1;
    }

    glog.is_verbose() && glog << "Protobuf is valid" << std::endl;
    glog.is_debug1() && glog << fleet_cfg.DebugString() << std::endl;

    return 0;
}
