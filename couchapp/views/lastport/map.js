function(doc) {
    if (doc.passport) {
    	if(doc.passport.length == 0)
        	emit(0, 1);
        else if (doc.passport[ doc.passport.length-1 ].city) //emit the last passport completed
        	emit( doc.passport[ doc.passport.length-1 ].city, 1);
    }
}