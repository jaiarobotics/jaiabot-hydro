#!/usr/bin/env python3

# Generates Goby3 protobuf configuration using definitions and text substitution
# Usage: python3 example.pb.cfg.py app_name

import sys
import os
from common import config
from common import is_simulation, is_runtime
import common, common.bot, common.comms, common.sim, common.udp

try:
    number_of_bots=int(os.environ['jaia_n_bots'])
except:
    config.fail('Must set jaia_n_bots environmental variable, e.g. "jaia_n_bots=10 jaia_bot_index=0  jaia_fleet_index=0  ./bot.launch"')

try:
    bot_index=int(os.environ['jaia_bot_index'])
except:
    config.fail('Must set jaia_bot_index environmental variable, e.g. "jaia_n_bots=10 jaia_bot_index=0  jaia_fleet_index=0  ./bot.launch"')

try:
    fleet_index=int(os.environ['jaia_fleet_index'])
except:
    config.fail('Must set jaia_fleet_index environmental variable, e.g. "jaia_n_bots=10 jaia_bot_index=0 jaia_fleet_index=0 ./bot.launch"')

log_file_dir = common.jaia_log_dir+ '/bot/' + str(bot_index)
debug_log_file_dir=log_file_dir 
templates_dir=common.jaia_templates_dir

node_id=common.bot.bot_index_to_node_id(bot_index)

verbosities = \
{ 'gobyd':                                        { 'runtime': { 'tty': 'WARN', 'log': 'DEBUG1' }, 'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'goby_liaison':                                 { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'WARN', 'log': 'WARN' }},
  'goby_gps':                                     { 'runtime': { 'tty': 'WARN', 'log': 'DEBUG2' }, 'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'goby_logger':                                  { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'goby_coroner':                                 { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'QUIET', 'log': 'QUIET' }},
  'jaiabot_health':                               { 'runtime': { 'tty': 'WARN', 'log': 'DEBUG2'},  'simulation': {'tty': 'WARN', 'log': 'QUIET'}},
  'jaiabot_metadata':                             { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'QUIET', 'log': 'QUIET' }},
  'jaiabot_fusion':                               { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'goby_moos_gateway':                            { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'QUIET', 'log': 'QUIET' }},
  'jaiabot_mission_manager':                      { 'runtime': { 'tty': 'WARN', 'log': 'DEBUG2' }, 'simulation': { 'tty': 'WARN', 'log': 'DEBUG2' }},
  'jaiabot_pid_control':                          { 'runtime': { 'tty': 'WARN', 'log': 'DEBUG2'},  'simulation': {'tty': 'WARN', 'log': 'QUIET'}},
  'jaiabot_simulator':                            { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'jaiabot_bluerobotics_pressure_sensor_driver':  { 'runtime': { 'tty': 'WARN', 'log': 'DEBUG2' }, 'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'jaiabot_atlas_scientific_ezo_ec_driver':       { 'runtime': { 'tty': 'WARN', 'log': 'DEBUG2' }, 'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'jaiabot_adafruit_BNO055_driver':               { 'runtime': { 'tty': 'WARN', 'log': 'DEBUG2' }, 'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'jaiabot_driver_arduino':              { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'QUIET', 'log': 'QUIET' }},
  'jaiabot_engineering':                          { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'QUIET', 'log': 'QUIET' }},
  'goby_terminate':                               { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'WARN', 'log': 'QUIET' }},
  'jaiabot_failure_reporter':                     { 'runtime': { 'tty': 'WARN', 'log': 'QUIET' },  'simulation': { 'tty': 'WARN', 'log': 'QUIET' }}
}

app_common = common.app_block(verbosities, debug_log_file_dir)

interprocess_common = config.template_substitute(templates_dir+'/_interprocess.pb.cfg.in',
                                                 platform='bot'+str(bot_index)+'_fleet' + str(fleet_index))

try:
    control_surfaces_driver_bounds = 'bounds { \n' + open('/etc/jaiabot/bounds.pb.cfg').read() + '\n}\n'
except FileNotFoundError:
    control_surfaces_driver_bounds = 'bounds {}'

if is_runtime():
    link_block = config.template_substitute(templates_dir+'/link_xbee.pb.cfg.in',
                                             subnet_mask=common.comms.subnet_mask,                                            
                                             modem_id=common.comms.xbee_modem_id(node_id),
                                             mac_slots=common.comms.xbee_mac_slots(node_id))

if is_simulation():
    link_block = config.template_substitute(templates_dir+'/link_udp.pb.cfg.in',
                                             subnet_mask=common.comms.subnet_mask,                                            
                                             modem_id=common.comms.wifi_modem_id(node_id),
                                             local_port=common.udp.wifi_udp_port(node_id),
                                             remotes=common.comms.wifi_remotes(node_id, number_of_bots),
                                             mac_slots=common.comms.wifi_mac_slots(node_id))
    
liaison_jaiabot_config = config.template_substitute(templates_dir+'/_liaison_jaiabot_config.pb.cfg.in', mode='BOT')


if common.app == 'gobyd':    
    print(config.template_substitute(templates_dir+'/gobyd.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     link_block=link_block,
                                     persist_subscriptions='persist_subscriptions { name: "bot" dir: "' + debug_log_file_dir + '" }'))
elif common.app == 'goby_coroner':    
    print(config.template_substitute(templates_dir+'/goby_coroner.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common))
elif common.app == 'jaiabot_health':    
    print(config.template_substitute(templates_dir+'/bot/jaiabot_health.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     # do not power off or restart the simulator computer
                                     ignore_powerstate_changes=is_simulation()))
elif common.app == 'goby_logger':    
    print(config.template_substitute(templates_dir+'/goby_logger.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     goby_logger_dir=log_file_dir))
elif common.app == 'goby_liaison' or common.app == 'goby_liaison_jaiabot':
    print(config.template_substitute(templates_dir+'/goby_liaison.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     http_port=30000+node_id,
                                     jaiabot_config=liaison_jaiabot_config,
                                     load_protobufs=''))
elif common.app == 'goby_moos_gateway':
    print(config.template_substitute(templates_dir+'/bot/goby_moos_gateway.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     moos_port=common.bot.moos_port(node_id)))
elif common.app == 'jaiabot_simulator':
    print(config.template_substitute(templates_dir+'/bot/jaiabot_simulator.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     moos_port=common.bot.moos_simulator_port(node_id),
                                     gpsd_simulator_udp_port=common.bot.gpsd_simulator_udp_port(node_id),
                                     pressure_udp_port=common.udp.bar30_cpp_udp_port(node_id),
                                     salinity_udp_port=common.udp.atlas_ezo_cpp_udp_port(node_id)))
elif common.app == 'jaiabot_bluerobotics_pressure_sensor_driver':
    print(config.template_substitute(templates_dir+'/bot/jaiabot_bluerobotics_pressure_sensor_driver.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     bind_port=common.udp.bar30_cpp_udp_port(node_id),
                                     remote_port=common.udp.bar30_py_udp_port(node_id)))
elif common.app == 'jaiabot_adafruit_BNO055_driver':
    print(config.template_substitute(templates_dir+'/bot/jaiabot_adafruit_BNO055_driver.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common))
elif common.app == 'jaiabot_atlas_scientific_ezo_ec_driver':
    print(config.template_substitute(templates_dir+'/bot/jaiabot_atlas_scientific_ezo_ec_driver.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     bind_port=common.udp.atlas_ezo_cpp_udp_port(node_id),
                                     remote_port=common.udp.atlas_ezo_py_udp_port(node_id)))
elif common.app == 'salinity-subscriber':
    print(config.template_substitute(templates_dir+'/bot/salinity-subscriber.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common))
elif common.app == 'jaiabot_fusion':
    print(config.template_substitute(templates_dir+'/bot/jaiabot_fusion.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     bot_id=bot_index))
elif common.app == 'jaiabot_mission_manager':
    print(config.template_substitute(templates_dir+'/bot/jaiabot_mission_manager.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     bot_id=bot_index,
                                     log_dir=log_file_dir))
elif common.app == 'jaiabot_failure_reporter':
    print(config.template_substitute(templates_dir+'/jaiabot_failure_reporter.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     goby_logger_dir=log_file_dir))
elif common.app == 'goby_terminate':
    print(config.template_substitute(templates_dir+'/goby_terminate.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common))
elif common.app == 'goby_gps':
    print(config.template_substitute(templates_dir+'/goby_gps.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     gpsd_port=common.bot.gpsd_port(node_id),
                                     gpsd_device=common.bot.gpsd_device(node_id)))
elif common.app == 'gpsd':
    print('-S {} -N {}'.format(common.bot.gpsd_port(node_id), common.bot.gpsd_device(node_id)))
elif common.app == 'moos':
    print(config.template_substitute(templates_dir+'/bot/bot.moos.in',
                                     moos_port=common.bot.moos_port(node_id),
                                     moos_community='BOT' + str(bot_index),
                                     warp=common.sim.warp,                                
                                     bhv_file='/tmp/jaiabot_' + str(bot_index) + '.bhv'))
elif common.app == 'bhv':
    print(config.template_substitute(templates_dir+'/bot/bot.bhv.in'))    
elif common.app == 'moos_sim':
    print(config.template_substitute(templates_dir+'/bot/bot-sim.moos.in',
                                     moos_port=common.bot.moos_simulator_port(node_id),
                                     moos_community='SIM' + str(bot_index),
                                     warp=common.sim.warp))
elif common.app == 'moos_pmv':
    print(config.template_substitute(templates_dir+'/bot/marineviewer.moos.in',
                                     moos_port=common.bot.moos_port(node_id),
                                     moos_community='BOT' + str(bot_index),
                                     warp=common.sim.warp))

elif common.app == 'frontseat_sim':
    print(common.vehicle.simulator_port(vehicle_id))
elif common.app == 'log_file':
    print(log_file_dir)
else:
    print(config.template_substitute(templates_dir+f'/bot/{common.app}.pb.cfg.in',
                                     app_block=app_common,
                                     interprocess_block = interprocess_common,
                                     bot_id=bot_index,
                                     control_surfaces_driver_bounds=control_surfaces_driver_bounds))
