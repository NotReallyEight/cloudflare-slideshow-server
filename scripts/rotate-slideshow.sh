#!/bin/bash

curl -X POST -H "Authorization: Bearer ${BEARER_TOKEN}" ${API_URL}/api/rotate-slideshow
