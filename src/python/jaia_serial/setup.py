#!/usr/bin/env python3
from setuptools import setup, find_packages

setup(name='jaia_serial',
      version='1.0',
      description='Jaia serial pipe for protobuf messages',
      author='Jaia Robotics',
      author_email='edsanville@gmail.com',
      url='https://www.jaia.tech',
      packages=find_packages(),
      install_requires=[
          'wheel', 
          'protobuf==3.20.0', 
          'pyserial'
          ]
    )
