function(doc, req){

  if(!doc.passport)
  	return false;

  if (req.query.lastport) {
      
    if(doc.passport.length == 0)
      return req.query.lastport === '0';
        
    return doc.passport[ doc.passport.length-1 ].city === req.query.lastport;
  }

  //could add other query parameters, such as 'first' or size to match against the number of values in the doc.passport array

  return false;
}