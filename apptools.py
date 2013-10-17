import ConfigParser


#a little class to hold the configuration and make it easier to pass around the info
class appConfig:

  def __init__ (self, configfile):
    self.readconfig(configfile)

  def readconfig(self, configfile):
    #read credentials configuration
    config = ConfigParser.RawConfigParser()
    config.read(configfile)

    self.server = config.get('Database', 'server')
    self.dbname = config.get('Database', 'dbname')
    self.username = config.get('Database', 'username')
    self.password = config.get('Database', 'password')
    self.viewname = config.get('Database', 'viewname')
    self.city = config.get('Database', 'city')
    self.message = config.get('Database', 'message')

    self.headers = {'content-type': 'application/json'}
    self.auth = (self.username, self.password)

