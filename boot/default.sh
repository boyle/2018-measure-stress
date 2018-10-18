#! /bin/bash
set -ex
echo "default install"

PUBLIC_IP=$(ec2metadata --public-ipv4)
DOMAIN=localhost
REPO_DIR=2018-measure-stress

echo "--- TODO tensorflow ---"
apt-get -y install python3-dev python3-pip
python3 --version
pip3 --version
pip3 install --upgrade tensorflow
python3 -c "import tensorflow as tf; print(tf.__version__)"
