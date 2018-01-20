#this is a utility script designed to provide function interfaces for converting values from stmp into scaled numbers for drawing.  This involves normalizing and changing values

from scipy.stats import norm
from numpy import linspace

#fit a single distribution given the attribute name and idx dicts
#deprecated, but good for testing
def fit_distribution(attrName, idxDict, data, numLines):
	l = []
	for i in range(1, numLines):
		line = data[i]
		val = line[idxDict[attrName]]
		l.append(float(val))
	param = norm.fit(l)
	return param

#function to test if something is a number
#from http://stackoverflow.com/questions/354038/how-do-i-check-if-a-string-is-a-number-float-in-python
def is_number(s):
    try:
        float(s)
        return True
    except ValueError:
        return False	

def fit_all_distributions(attrNames, idxDict, data, numLines):
	fits = {}
	#initialize the dictionary with the names of attributes we will track
	for name in attrNames:
		fits[name] = []
	#add values if they are numeric
	for i in range(1, numLines):
		line = data[i]
		for name in attrNames:
			val = line[idxDict[name]]
			if is_number(val):
				fits[name].append(float(val))
	#add fits
	for key, value in fits.items():
		fits[key] = norm.fit(value)
	return fits

def get_drawing_val(attr, value, distributionDict):
	C = 5
	mean, std = distributionDict[attr]
	#get rid of the values that aren't a number
	if not is_number(mean) or not is_number(std) or not is_number(value):
		return 0
	#otherwise return a constant times the number of standard deviaitons from the mean
	else:
		divergence = abs(float(value) - float(mean))/float(std)
		return C*divergence











