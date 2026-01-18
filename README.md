# first installation of proxmox-ve

gateway?
dns 192.168.178.1


# install mise

curl https://mise.run | sh

proxy manager
http://192.168.178.38:81

# configure fritzbox DNS to 192.168.178.39 (adguard)
# configure tailscale DNS to 192.168.178.39 (adguard)

# configure AD DNS

rewrite DNS
*.trazzi.lol to 192.168.178.38 (npm)
trazzi.lol to 192.168.178.38 (npm)


in the fritzbox set the internal network dns to the adguard ip, both 4 and 6

