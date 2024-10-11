#!/usr/bin/env python3

import atlas_oem
import datetime
import time

probe = atlas_oem.AtlasOEM()
probe.setActiveHibernate(1)


def clearScreen():
    print('\033[2J\033[H')


def presentMenu(menu):
    item_func_dict = { item['key'].lower(): item['func'] for item in menu['items'] }

    done = False
    while not done:
        clearScreen()
        print(datetime.datetime.now())
        probe.dump()
        print()
        print()
        print()
        print(menu['title'])
        print('============')
        print()

        for item in menu['items']:
            print(f'{item["key"]}) {item["description"]}')

        print()

        choice = input('Enter choice > ')

        if choice.lower() in item_func_dict:
            func = item_func_dict[choice]

            if func is None:
                return
            else:
                func()
        else:
            print('Invalid choice.')
            input()

def pollEC():
    print('Getting 10 seconds of data...')
    ec_old = None
    for i in range(0, 10):
        ec = probe.EC()
        if ec_old:
            delta_percent = abs(ec - ec_old) / ec_old * 100
        else:
            delta_percent = 0.0
        print(f'time: {datetime.datetime.now()}  EC: {ec: 6.0f}  delta: {delta_percent: 3.2f}%')
        ec_old = ec
        time.sleep(1)

def setProbeType():
    value = input('Enter probe type value (K value) > ')

    try:
        probe.setProbeType(float(value))
    except ValueError:
        input('K value must be a number [press enter to continue]')

def setTemperatureCompensation():
    value = input('Enter temperature of solution (deg C) > ')

    try:
        probe.setTemperatureCompensation(float(value))
    except ValueError:
        input('T value must be a number [press enter to continue]')


def printProbeStatus():
    try:
        clearScreen()
        print(datetime.datetime.now())
        probe.dump()
        input('Press enter to continue')
    except Exception as e:
        print(f'Error: {e}')


def clearCalibration():
    probe.setCalibrationRequest(1)
    input('Calibration data cleared.  Press enter.')


def doCalibration(description: str, type: int):
    if description != 'DRY':
        value = input(f'{description} calibration value: ')
    else:
        value = 0

    while True:
        print('Getting 10 seconds of data...')
        ec_old = None
        for i in range(0, 10):
            ec = probe.EC()
            if ec_old:
                delta_percent = abs(ec - ec_old) / ec_old * 100
            else:
                delta_percent = 0.0
            print(f'time:{datetime.datetime.now()}  EC: {ec: 6.0f}  delta: {delta_percent: 3.2f}%')
            ec_old = ec
            time.sleep(1)
        if input('Calibrate now (Y/n)?').lower() in ['', 'y']:
            break

    try:
        probe.setCalibration(float(value))
        probe.setCalibrationRequest(type)
        input(f'{description} calibration completed.  Press enter.')
    except ValueError:
        input('Value must be a number.  Press enter.')

def doJaiaCalibration(description: str, type: int, value: int):
    while True: 
        print(f"Running {description} calibration at {value} μS/cm.")
        ec_old = None
        delta_list = []
        for i in range(0,10):
            ec = probe.EC()
            if ec_old:
                delta_percent = abs(ec - ec_old) / ec_old * 100
            else:
                delta_percent = 0.0
            delta_list.append(delta_percent)
            ec_old = ec
        
        if delta_list.max() < 0.10:
            break
    
    input(f"{description} calibration at {value} μS/cm complete. Press enter")
    probe.setCalibration(value)
    probe.setCalibrationRequest(type)


def jaiaCalibration():
    # Give countdown for user to prepare for calibration to begin
    countdown = 5
    while countdown != -1:
        print(f"Starting calibration procedure... {countdown}")
        countdown -= 1
        time.sleep(1)
        clearScreen()

    # Start from a fresh calibration state
    clearCalibration()

    # Set the probe type to the Jaia default
    # This must be changed if the probe ever changes from K 1.0
    probe.setProbeType(1.0)

    # Get temperature of solution from user
    setTemperatureCompensation()

    # Ensure probe is dry
    print("To begin calibrating, the probe must be completely dry.")
    time.sleep(1)
    input("Once you've ensured the probe is completely dry, press enter.")

    doJaiaCalibration()


def dryCalibration():
    doCalibration('DRY', 2)


def singlePointCalibration():
    doCalibration('SINGLE POINT', 3)


def highCalibration():
    doCalibration('DUAL POINT HIGH', 5)
    doCalibration('DUAL POINT HIGH', 5)


def lowCalibration():
    doCalibration('DUAL POINT LOW', 4)
    doCalibration('DUAL POINT LOW', 4)


def calibrate():
    presentMenu({
        'title': 'Calibrate',
        'items': [
            {
                'description': 'Clear Calibration Data',
                'key': 'c',
                'func': clearCalibration
            },
            {
                'description': 'Jaia Calibration',
                'key': 'j',
                'func': jaiaCalibration
            },
            {
                'description': 'Dry Calibration',
                'key': 'd',
                'func': dryCalibration
            },
            {
                'description': 'Single Point Calibration',
                'key': 's',
                'func': singlePointCalibration
            },
            {
                'description': 'Dual Point Low Calibration',
                'key': 'l',
                'func': lowCalibration
            },
            {
                'description': 'Dual Point High Calibration',
                'key': 'h',
                'func': highCalibration
            },
            {
                'description': 'Exit Menu',
                'key': 'e',
                'func': None
            }
        ]
    })


presentMenu({
    'title': 'Main Menu',
    'items': [
        {
            'description': 'Print probe status',
            'key': 's',
            'key': 's',
            'func': printProbeStatus
        },
        {
            'description': 'Poll EC for 10 seconds',
            'key': 'l',
            'func': pollEC
        },
        {
            'description': 'Set probe type',
            'key': 'p',
            'key': 'p',
            'func': setProbeType
        },
        {
            'description': 'Set temperature compensation',
            'key': 't',
            'func': setTemperatureCompensation
        },
        {
            'description': 'Set temperature compensation',
            'key': 't',
            'func': setTemperatureCompensation
        },
        {
            'description': 'Calibrate',
            'key': 'c',
            'func': calibrate
        },
        {
            'description': 'Exit Program',
            'key': 'e',
            'func': None
        }
    ]
})
