Measure Stress
[![Build Status](https://travis-ci.com/boyle/2018-measure-stress.svg?token=ppJxXrcSY7ZkfdM9JuFM&branch=master)](https://travis-ci.com/boyle/2018-measure-stress)
[![Coverage Status](https://coveralls.io/repos/github/boyle/2018-measure-stress/badge.svg?branch=master)](https://coveralls.io/github/boyle/2018-measure-stress?branch=master)
==============

The project title is:

> Using machine learning to investigate sympathetic activation of the autonomic
> nervous system (SAANS) during the treatment of mild traumatic brain injury,
> chronic pain, and post-traumatic stress disorder.


Summary
-------

The goal of this research is to further our understanding and clinical
management of Canadian Forces service members and veterans suffering from a
complex medical triad of traumatic brain injury, chronic pain, and
post-traumatic stress disorder. Over half of rehabilitation patients experience
one or more of these complex medical conditions, often associated with
intractable symptoms which do not respond to traditional treatment options, and
impairing their ability to function effectively at work and in the community.
Using a Computer Assisted Rehabilitation Environment (CAREN) this research will
collect and consolidate a series of non-invasive whole- body biological
measurements from patients during immersive therapy sessions in the CAREN
Virtual Reality facility. High-performance computing and machine learning will
be used to develop and deploy real-time estimators of SAANS. These systems will
allow clinicians to create individualized treatment plans for patients, thereby
maximizing rehabilitation benefits and avoiding costly setbacks in patient
treatment.

Contributors and Partners
-------------------------

- Jim Green *Principle Investigator*
- Adrian Chan *co-Principle Investigator*
- Andrew Smith *Post Doctoral Fellow*
- Alistair Boyle *Post Doctoral Fellow*
- Roger Selzler *Ph.D. Student*
- Francois Charih *Intern*
- Dr. Jen McDonald *The Ottawa Hospital Rehab Centre*
- Janet Holly *The Ottawa Hospital Rehab Centre*
- L.Col Dr. Markus Besemann *Canadian Forces, Health Services*
- Col Dr. Rakesh Jetly *Canadian Forces, Health Services*
- Dr. Gaurav Gupta *Canadian Forces, Health Services*
- John Whitnall *IBM*

Repository Structure
--------------------

The 'boot' directory contains the boot scripts to configure cloud compute
resources from a bare Ubuntu 18.04 installation, to a functional appliance.

The 'www' directory contains the website which will be hosted on the
public/internet facing side of the cloud environment. These pages will be
publicly accessible. Pages should redirect to https for secure (SSL)
connections. Private research group information should be password protected.

Remote Access from a Linux Host
-------------------------------

From a linux host, you can get ssh access to the web server front-end using `ssh <user>@saans.ca`.
To get to other servers in the system you can ssh via a "jump host" if you know the IP address of the local system
`ssh -J <user>@saans.ca <user>@<ip>` for an internal `<ip>` address such as `172.16.59.9`.
You must have an account as `<user>` on the web server.
If your username on your local computer matches that on the remote system you
can drop the `<user>@` portion of the command.

For example, to get to one of the compute nodes: `ssh -J boyle@saans.ca boyle@172.16.59.9`

Similarly, one can get a graphical VNC session, by connecting through a competent VNC client
such as [TigerVNC](https://tigervnc.org/):
`vncviewer -via boyle@saans.ca 172.16.59.9:10` where the `:10` is the VNC port
number reported when you start a VNC server session `vncserver` from the
command line.
TigerVNC is available for windows machines as well: you will need to configure
your SSH keys, but access will then work equally well from windows or linux.

SSH password authentication is disabled on all systems. You need an authentication key to login.
See `ssh-keygen` and provide the public key (`id_rsa.pub`) to whomever is administering the servers.
