# Jaia Web Applications

## Jaia Command and Control (JCC)

This mission planning and control application allows you to create mission plans and monitor your JaiaBots and JaiaHubs as they perform their missions.

## Jaia Engineering and Debugging (JED)

This application allows you to send lower-level engineering commands directly to JaiaBots, such as adjusting motor and rudder values.

## Jaia Data Vision (JDV)

This data analysis application views logs from JaiaHubs and JaiaBots, presenting you with maps and allows you to chart any of the recorded data from past missions.

## Running

The Jaia web source code is located in the `src/web` directory. In this directory is a script called `run.sh`, which will build and launch JCC and JED. Both apps will then be accessible from your browser.

When using the `run.sh` script, JCC and JED will be built and run using the `Development` build mode. This means that the code will not be minified, and the source directories will be watched (monitored for any changes). If any changes are detected, the apps will be rebuilt so that you may refresh your browser and see the code changes.

There is also a `run.sh` script in the `src/web/jdv` directory, which will build and run `JDV` in the same way.

## Project Structure
