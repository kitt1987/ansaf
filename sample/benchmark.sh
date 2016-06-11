#!/bin/bash

COUNTER=10000
until [  $COUNTER -lt 1 ]; do
   curl -X POST http://localhost:4321/increase
   let COUNTER-=1
done
