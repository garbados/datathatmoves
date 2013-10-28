import passportcontrol
import apptools

myconfig = apptools.appConfig('washingtondc.ini')
passportcontrol.run(myconfig, 'Chicago')
