import passportcontrol
import apptools

myconfig = apptools.appConfig('amsterdam.ini')

passportcontrol.run(myconfig, 'WashingtonDC')
