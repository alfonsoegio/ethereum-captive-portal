# Portal Cautivo Ethereum

## Resumen

Portal cautivo de acceso a internet basado en Ethereum
sobre Raspberry Pi; probado sobre [OSMC](https://osmc.tv/);
debería funcionar del mismo modo sobre Raspbian.

## Configuración

### Actualización del sistema OSMC e instalación de software necesario:

```
osmc@osmc:$ sudo apt-get update
osmc@osmc:$ sudo apt-get dist-upgrade
osmc@osmc:$ sudo apt-get autoremove
osmc@osmc:$ sudo apt-get clean
osmc@osmc:$ sudo apt-get install dnsmasq hostapd rfkill iptables
```

### Comprobación de la configuración del chip Wi-Fi con rfkill

En mi caso estaba inhabilitado por software:

```
osmc@osmc:$ rfkill list
0: phy0: Wireless LAN
	Soft blocked: yes
	Hard blocked: no
1: hci0: Bluetooth
	Soft blocked: yes
	Hard blocked: no
```

de modo que tuve que ejecutar:

```
osmc@osmc:$ sudo rfkill unblock 0
```

### Configuración de hostapd

[hostapd](https://en.wikipedia.org/wiki/Hostapd)
es un servicio de Linux que permite crear
puntos de acceso y autenticación Wi-Fi.
La configuración que he utilizado es la siguiente (fichero /etc/hostapd/hostapd.conf):

```
interface=wlan0
driver=nl80211
country_code=ES
ssid=hostapd
ieee80211d=1
hw_mode=g
channel=3
ieee80211n=1
wmm_enabled=1
ht_capab=[HT40][SHORT-GI-20][DSSS_CCK-40]
macaddr_acl=0
auth_algs=1
ignore_broadcast_ssid=0
wpa=2
wpa_key_mgmt=WPA-PSK
wpa_passphrase=SECRETSECRET
rsn_pairwise=CCMP
```
Para aplicar la configuración hay que referenciar el fichero en
/etc/default/hostapd buscando y editando la linea:

```
DAEMON_CONF="/etc/hostapd/hostapd.conf"
```

### Configuración de dnsmasq

servicio Linux con una doble función; resuelve nombres de hosts a direcciones
ip (DNS - Domain Name Service) y además provee de direcciones ip
a clientes (DHCP - Dynamic Host Configuration Protocol) y será el
responsable de asignar direcciones ip a los dispositivos que se conecten a
nuestro punto de acceso Wi-Fi hostapd. Para el caso y
editando el fichero /etc/dnsmasq.conf con las siguientes lineas:

```
interface=wlan0
dhcp-range=wlan0,192.168.4.50,192.168.4.150,12h
```

Es decir: le indicamos a dnsmasq que sirva direcciones de la 192.168.4.50
a la 192.168.4.150 a aquellos clientes que las soliciten
por la interfaz Wi-Fi de la Raspberry wlan0 gestionada por hostapd.

### Configuración de la interfaz ip

Una vez hecho todo lo anterior llega el momento de habilitar la interfaz Wi-Fi
de la Raspberry y asignarle una dirección ip en la misma
subnet configurada en dnsmasq:

```
osmc@osmc:$ sudo ip link set wlan0 up
osmc@osmc:$ sudo ifconfig wlan0 192.168.4.1
```

Hecho lo anterior, queda reiniciar los servicios:

```
osmc@osmc:$ sudo systemctl restart dnsmasq
osmc@osmc:$ sudo systemctl restart hostapd
```

A partir de este momento, usando un móvil u otro portátil podríamos ver el
nuevo punto de acceso Wi-Fi proporcionado por la Raspberry y
conectarnos a él mediante un móvil.

### Configuración iptables

Finalmente, instalar unas reglas en el firewall iptables para descartar enviar paquetes al router
desde cualquier dispositivo conectado a la red del hotspot por defecto:

```
osmc@osmc:$ sudo iptables -t filter -P FORWARD DROP
```

En lugar de dar acceso a internet, inicialmente queremos que los usuarios
se conecten al portal cautivo descrito más abajo; por lo tanto lo que haremos
será instalar una regla en iptables que redirija todo el tráfico http a la ip
de la raspberry a la ip correspondiente:

```
osmc@osmc:$ sudo iptables -t nat -A PREROUTING -i wlan0 -d 0.0.0.0/0 -p tcp --dport 80 -j  DNAT --to-destination 192.168.4.1:80
```

## Despliegue del portal cautivo


Probado utilizando [nodeenv](https://github.com/ekalinin/nodeenv)

```
osmc@osmc:$ git clone https://github.com/alfonsoegio/ethereum-captive-portal.git
osmc@osmc:$ cd ethereum-captive-portal
osmc@osmc:$ nodeenv --node 10.15.1 venv
osmc@osmc:$ source venv/bin/activate
(venv) osmc@osmc:$ npm install
```

### Build de la interfaz React

Para construir los ficheros del frontend:

```
(venv) osmc@osmc:$ cd portal
(venv) osmc@osmc:$ npm run build
```

### Backend

Para levantar el server (contiene un pequeño backend que resuelve la MAC a partir de la ip
y a la vez sirve el portal react):

```
(venv) osmc@osmc:$ cd ../backend
(venv) osmc@osmc:$ sudo node index.js
```
