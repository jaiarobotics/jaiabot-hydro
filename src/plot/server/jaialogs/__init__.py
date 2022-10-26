from cmath import isnan
from dataclasses import dataclass, field
from email.policy import default
import glob
from typing import Iterable, Type
import h5py
import logging
import json
import re
import math
import copy
import datetime
import os

import numpy

from .objects import *
from .moos_messages import *

INT32_MAX = (2 << 30) - 1
UINT32_MAX = (2 << 31) - 1

LOG_DIR='logs'

# Utility functions

def set_directory(directory):
    global LOG_DIR
    LOG_DIR = directory
    logging.info(f'Log directory: {directory}')
    os.makedirs(directory, exist_ok=True)

def get_root_item_path(path, root_item=''):
    '''Get the path to a root_item associated with that path'''
    components = path.split('/')
    components = components[:2] + [root_item]
    return '/'.join(components)


def h5_get_series(dataset):
    '''Get a filtered, JSON-serializable representation of an h5 dataset'''
    dtype = dataset.dtype

    def from_float(x):
        x = float(x)
        if math.isnan(x):
            return None
        return x

    def from_int32(x):
        if x == INT32_MAX:
            return None
        return int(x)

    def from_uint32(x):
        if x == UINT32_MAX:
            return None
        return int(x)

    dtype_proc = {
        'f': from_float,
        'i': from_int32,
        'u': from_uint32
    }

    map_proc = dtype_proc[dtype.kind]
    filtered_list = [map_proc(x) for x in dataset]

    return filtered_list


def h5_get_string(dataset):
    s = ''.join([chr(a) for a in list(list(dataset)[0])])
    return s


def h5_get_hovertext(dataset):
    '''Get the hovertext for an h5 dataset'''

    # Get the enum value names
    try:
        enum_names = dataset.attrs['enum_names']
        enum_values = dataset.attrs['enum_values']
        enum_dict = { int(enum_values[index]): enum_names[index] for index in range(0, len(enum_values))}
        return enum_dict

    except KeyError:
        return None


# Path descriptions

try:
    path_descriptions = json.load(open('jaiabot_paths.json'))
except FileNotFoundError:
    path_descriptions = {}


def jaia_get_description(path):
    for description in path_descriptions:
        if 'path' in description:
            if description['path'] == path:
                return description
        
        if 'path_regex' in description:
            if re.match(description['path_regex'], path):
                return description
    
    return None

def get_title_from_path(path):
    components = path.split('/')
    if len(components) < 2:
        logging.warning(f'Not enough components in path: {path}')
        return ''

    components = components[1:]

    message_type_components = components[0].split('.')

    if len(message_type_components) < 1:
        logging.warning(f'Invalid path: {path}')
        return ''

    components[0] = components[0].split('.')[-1]
    return '/'.join(components)

# Data fetch functions

def get_logs():
    '''Get list of available logs'''
    results = []
    logging.warning('log_dir = ' + LOG_DIR)
    for filename in glob.glob(LOG_DIR + '/*_*_*.h5'):
        components = re.match(r'.*/(.+)_(.+)_(.+)\.h5$', filename)
        bot, fleet, date_string = components.groups()

        try:
            date = datetime.datetime.strptime(date_string, r'%Y%m%dT%H%M%S').replace(tzinfo=datetime.timezone.utc)
        except ValueError:
            logging.warning(f'No date in file {filename}')
            continue

        # Get duration of this log
        try:
            path = 'goby::health::report/goby.middleware.protobuf.VehicleHealth/_utime_'
            h5_file = h5py.File(filename)
            start = h5_file[path][0]
            end = h5_file[path][-1]
            duration = int(end - start)
        except (OSError, KeyError):
            logging.warning(f'No duration in file {filename}')
            continue

        results.append({
            'bot': bot,
            'fleet': fleet,
            'timestamp': date.timestamp(),
            'duration': duration,
            'filename': filename
        })

    return results


def get_fields(log_names, root_path='/'):
    '''Get a list of the fields below a root path in a set of logs'''
    fields = set()

    if log_names is None:
        return []

    if root_path is None or root_path == '':
        root_path = '/'
    else:
        # h5py doesn't like initial slashes, unless it's the root path
        root_path = root_path.lstrip('/')

    log_names = log_names.split(',')
    
    for log_name in log_names:
        h5_file = h5py.File(log_name)
        try:
            fields = fields.union(h5_file[root_path].keys())
        except AttributeError:
            # If this path is a dataset, it has no "keys()"
            pass
    
    series = list(fields)
    series.sort()

    return series


@dataclass
class Series:
    utime: list
    y_values: list
    hovertext: dict

    def __init__(self, log=None, path=None, scheme=1, invalid_values=set()) -> None:
        self.utime = []
        self.y_values = []
        self.hovertext = {}

        if log:
            try:
                _utime__array = log[get_root_item_path(path, '_utime_')]
                _scheme__array = log[get_root_item_path(path, '_scheme_')]
                path_array = log[path]

                series = zip(h5_get_series(_utime__array), h5_get_series(_scheme__array), h5_get_series(path_array))
                series = filter(lambda pt: pt[1] == scheme and pt[2] not in invalid_values, series)

                self.utime, schemes, self.y_values = zip(*series)
            except (ValueError, KeyError):
                logging.warning(f'No valid data found for log: {log.filename}, series path: {path}')
                self.utime = []
                self.schemes = []
                self.y_values = []
                self.hovertext = {}

                return

            self.hovertext = h5_get_hovertext(log[path]) or {}

    def __add__(self, other_series: 'Series'):
        r = copy.copy(self)
        r.utime += list(other_series.utime)
        r.y_values += list(other_series.y_values)
        r.hovertext.update(other_series.hovertext)
        return r

    def sort(self):
        if len(self.utime) > 0 and len(self.y_values) > 0:
            self.utime, self.y_values = zip(*sorted(zip(self.utime, self.y_values)))
        else:
            logging.warning(f'Not enough values to sort.  len(utime) = {len(self.utime)}, len(y_values) = {len(self.y_values)}')


def get_series(log_names, paths):
    '''Get a series'''

    if log_names is None or paths is None:
        return []

    series_list = []

    log_names = log_names.split(',')
    paths = [path.lstrip('/') for path in paths.split(',')]

    # Open all our logs
    logs = [h5py.File(log_name) for log_name in log_names]

    # Get the series from the logs
    for path in paths:
        series_description = jaia_get_description(path) or {}
        invalid_values = set(series_description.get('invalid_values', []))

        series = Series()

        for log in logs:
            try:
                series += Series(log=log, path=path, scheme=1, invalid_values=invalid_values)
            except KeyError as e:
                logging.warn(e)
                continue

        series.sort()

        title = get_title_from_path(path)
        y_axis_title = title
        units = series_description.get('units')

        if units is not None:
            y_axis_title += f'\n({units})'

        series_list.append({
            'path': path,
            'title': title,
            'y_axis_title': y_axis_title,
            '_utime_': series.utime,
            'series_y': series.y_values,
            'hovertext': series.hovertext
        })

    return series_list


def get_map(log_names):
    if log_names is None:
        return []

    log_names = log_names.split(',')

    # Open all our logs
    logs = [h5py.File(log_name) for log_name in log_names]

    BotStatus_lat_path = 'jaiabot::bot_status;0/jaiabot.protobuf.BotStatus/location/lat'
    BotStatus_lon_path = 'jaiabot::bot_status;0/jaiabot.protobuf.BotStatus/location/lon'

    seriesList = []

    for log in logs:
        lat_series = Series(log=log, path=BotStatus_lat_path, invalid_values=[0])
        lon_series = Series(log=log, path=BotStatus_lon_path, invalid_values=[0])

        thisSeries = []

        for i, lat in enumerate(lat_series.y_values):
            thisSeries.append([lat_series.utime[i], lat_series.y_values[i], lon_series.y_values[i]])

        seriesList.append(thisSeries)

    return seriesList


HUB_COMMAND_RE = re.compile(r'jaiabot::hub_command.*;([0-9]+)')

def get_commands(log_filenames):

    # Open all our logs
    log_files = [h5py.File(log_name) for log_name in log_filenames]

    # A dictionary mapping bot_id to an array of mission dictionaries
    results = {}

    for log_file in log_files:
        
        # Search for Command items
        for path in log_file.keys():

            m = HUB_COMMAND_RE.match(path)
            if m is not None:
                bot_id = m.group(1)
                hub_command_path = path

                if bot_id not in results:
                    results[bot_id] = []
                
                command_path = hub_command_path + '/jaiabot.protobuf.Command'
                commands = jaialog_get_object_list(log_file[command_path], repeated_members={"goal"})

                results[bot_id] = commands

    return results


BOT_STATUS_RE = re.compile(r'^jaiabot::bot_status.*;([0-9]+)/jaiabot.protobuf.BotStatus$')


def get_active_goals(log_filenames):

    # Open all our logs
    log_files = [h5py.File(log_name) for log_name in log_filenames]

    # A dictionary mapping bot_id to an array of active_goal dictionaries
    results = {}

    for log_file in log_files:

        def visit_path(name, object):
            m = BOT_STATUS_RE.match(name)

            if m is not None:
                bot_id = m.group(1)
                if bot_id not in results:
                    results[bot_id] = []

                _utime_ = h5_get_series(log_file[name + '/_utime_'])
                bot_ids = h5_get_series(log_file[name + '/bot_id'])
                active_goals = h5_get_series(log_file[name + '/active_goal'])

                last_active_goal = None
                for i in range(len(_utime_)):
                    if active_goals[i] != last_active_goal:
                        results[bot_id].append({
                            '_utime_': _utime_[i],
                            'active_goal': active_goals[i]
                        })
                        
                        last_active_goal = active_goals[i]

        log_file.visititems(visit_path)

    return results

################################################
# Reading tasks
# get_task_packets returns a list of tasks like so:
# [
#   {
#     "_datenum_": 815848.3725064587,
#     "_scheme_": 2,
#     "_utime_": 8321993784558025,
#     "bot_id": 1,
#     "dive": {
#       "depth_achieved": 10,
#       "dive_rate": 0.5,
#       "duration_to_acquire_gps": 1.5,
#       "measurement": {
#         "mean_depth": [
#           10,
#           null
#         ],
#         "mean_salinity": [
#           20,
#           null
#         ],
#         "mean_temperature": [
#           14.5,
#           null
#         ]
#       },
#       "powered_rise_rate": 0.3,
#       "start_location": {
#         "lat": 43.517494,
#         "lon": -72.115236
#       },
#       "unpowered_rise_rate": 0.3
#     },
#     "drift": {
#       "drift_duration": 0,
#       "end_location": {
#         "lat": 43.517738,
#         "lon": -72.115225
#       },
#       "estimated_drift": {
#         "speed": 0
#       },
#       "start_location": {
#         "lat": 43.517736,
#         "lon": -72.115225
#       }
#     },
#     "end_time": 1664441785000000,
#     "start_time": 1664441686000000,
#     "type": "DIVE"
#   },
#   ...
#   ]


TASK_PACKET_RE = re.compile(r'jaiabot::task_packet.*;([0-9]+)')

def get_task_packets(log_filenames):

    # Open all our logs
    log_files = [h5py.File(log_name) for log_name in log_filenames]

    # A dictionary mapping bot_id to an array of mission dictionaries
    results = []

    for log_file in log_files:
        
        # Search for Command items
        for path in log_file.keys():

            m = TASK_PACKET_RE.match(path)
            if m is not None:
                task_packet_group_path = path

                task_packet_path = task_packet_group_path + '/jaiabot.protobuf.TaskPacket'
                task_packets = jaialog_get_object_list(log_file[task_packet_path], repeated_members={"measurement"})

                results += task_packets

    return results
