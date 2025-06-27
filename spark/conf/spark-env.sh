#!/usr/bin/env bash

# Set LD_PRELOAD for NSS wrapper compatibility
export LD_PRELOAD=/opt/bitnami/common/lib/libnss_wrapper.so

# Set JAVA_HOME
export JAVA_HOME=/opt/bitnami/java

# Set SPARK_HOME
export SPARK_HOME=/opt/bitnami/spark

# Set HADOOP_HOME for Hadoop integration
export HADOOP_HOME=/opt/hadoop

# Set HADOOP_CONF_DIR
export HADOOP_CONF_DIR=$HADOOP_HOME/etc/hadoop

