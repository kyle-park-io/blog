#!/bin/sh

cp /blog/cron/update-blog /etc/cron.d/update-blog
chmod 0644 /etc/cron.d/update-blog
crontab /etc/cron.d/update-blog
