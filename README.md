# first installation of proxmox-ve

ip 192.168.178.65
gateway?
dns 192.168.178.1


# install mise

curl https://mise.run | sh

proxy manager
http://192.168.178.38:81

in the fritzbox set the internal network dns to the adguard ip, both 4 and 6

adguard
-setup
http://192.168.178.39:3000
-admin
http://192.168.178.39
-dns
192.168.178.39:53

glance
http://192.168.178.40:8080

jellyfin
http://192.168.178.41:8096
