#written by Noah Friedman

#What does this script do, you may ask.
#Good question! 
#Its purpose is to take raw STMP data from the stmp TSV and properly format it for drawing by the STMP visualization program itself.
#This involves reading through the tsv, selecting values of interest, and converting them into proper "drawing vals" for the visualization.
#All that is done in here, in python.
#Python is so much easier than java, and I designed this so java does the bare minimum except drawing.e

import sys
import os
import random
import json
import drawing_functions
import pandas as pd

#we add the xls_utils file I have created to the path
#ALERT! this will have to change
xls_utils_path = '/Users/noahfriedman/Desktop/igvProject/xls_utils'
sys.path.append(xls_utils_path)
import xls_parsing_functions

#ALERT: maybe an api implements this better but basically I just want to have a variable 'X = 1 | 2' so I wrote this code
#a dictionary mapping an inuitive name (ie chromosome) to all the valid values it could have 
#there are three column dicts, one for each class of variable: 'infoFields' 'numericAnnotations', 'stringAnnotations'
#The purpose of the data structures is twofold: to enumerate where different fields go, and establish mappings to deal with ambiguously named columns
#ALERT: maybe in the future this should be determined by a input parameter
infoColumnCorrespondenceDict = {
	'chromosome': ('CHROM', 'Chromosome'),
	'ref': ('REF', 'Reference Allele', 'Reference Nucleotide'), 
	'alt':('ALT', 'Sample Allele', 'Variant Nucleotide'), 
	'pos': ('POS', 'Position', 'Start')
}

numericColumnCorrespondenceDict = {
	'fullExac': ('hg19_popfreq_all_20150413_exac_all', 'ExAC (AF%)', 'ExAC (%)', 'ExAC'),
	#ALERT: please confirm this is the correct interpretation
	'europeExac': ('ExAC European', 'hg19_popfreq_all_20150413_exac_nfe'),
	'1kgenomes': ('1000 Genomes', 'hg19_popfreq_all_20150413_1000g_all')
 }

stringColumnCorrespondenceDict = {
 	'clinvar': ('clinvar_clinical_significance')
 }

#defaultNumericDrawingCols = ['QUAL','Max_Allele_Freq_Summary','hg19_phastConsElements46way_r_MSA_MCE_lod','hg19_ljb26_all_CADD_raw','AD','hg19_ljb26_all_Polyphen2_HDIV_score','exac_tolerance_r_lof_z','DP']
#defaultStringDrawingCols = ['clinvar_clinical_significance','Function_Summary','ExonicFunction_Summary']
	
#----------------------------------------------------------------

#reads out necessary fields from the annotation tsv file
#DEPRECATED! Here only in case we want to allow the user to provide a TSV as the input file
def read_tsv(tsv):
	data = []
	with open(tsv) as f:
		lines = f.readlines()
		#just to be safe we strip out all returns from the input data (carriage returns and new line returns)
		columns = lines[0].strip('\n').strip('\r').split('\t')
		print columns
		#for line in lines[1:]:
		for line in lines[1:100]:
			data.append(line.strip('\n').strip('\r').split('\t'))
	return columns, data

#iterates through the values in a 



#gets basic variant info (i.e ref/alt etc) and writes it
def get_variant_info(variantLine, idx_dict, variantRecord):
	#CHANGE the structure of this
	for col in infoCols:
		val = variantLine[idx_dict[col]]
		#ensure that we don't append the empty string, this breaks interpretation
		if val == '': val = 'na'
		if col == 'Gene_Summary': val = random.choice(['OR2T35', "BRCA1", "AFF3", "MYO7B", "ZNF806", "NEB", "SP100", "SYN2"])

		variantRecord['coreStmpFields']['infoFields'][col] = val

#writes output to a file that can then be read by the graphical interface
#each variant gets its own file
def write_file(columns, linesToWrite, pos):
	savePath = "/home/noahfrie/noahfrie/devCode/stmpViz/outputFiles"
	fullName = os.path.join(savePath, pos +'viz.txt')
	f = open(fullName, 'w')
	for line in linesToWrite:
		f.write(line)
		f.write('\n')
	f.close

#initializes the json dictionary structure used to store data values
#the structure is:
#for each variant: 
#{
#	coreStmpFields: {
# 		infoFields: {}
# 		numericAnnotations: {}	
# 		stringAnnotations: {}
#	}
#	metainfo?
#}

#the templates for what these parts of the json should look like
infoFieldTemplate = {'value': '', 'includeInDrawing': False}
numericAnnotationTemplate = {'value': '', 'drawingValue': '', 'includeInDrawing': False, 'associatedValues': []}
stringAnnotationTemplate = {'value': '', 'drawingValue': '', 'includeInDrawing': False, 'associatedValues': []}
otherFieldTemplate = {'value': '', 'drawingValue': '', 'includeInDrawing': False, 'associatedValues': []}

#converts a row of the data frame to a json file for the visualization
def convert_df_row_to_json(row, curDf):
	#build up the simple skeleton of the json 
	variant = {}
	coreAnnotationFields = {'infoFields': '', 'numericAnnotations': '', 'stringAnnotations': '', 'otherFields': ''}
	variant['coreAnnotationFields'] = coreAnnotationFields
	infoFields = {}
	numericAnnotations = {}
	stringAnnotations = {}
	otherFields = {}

	colnames = curDf.columns
	for col in colnames:
		if xls_parsing_functions.find_official_column_name(infoColumnCorrespondenceDict, col, curDf) != None:
			valName = xls_parsing_functions.find_official_column_name(infoColumnCorrespondenceDict, col, curDf)
			infoFieldSkeleton = infoFieldTemplate
			infoFieldSkeleton['value'] = row[col]
			infoFields[valName] = infoFieldSkeleton
		elif xls_parsing_functions.find_official_column_name(numericColumnCorrespondenceDict, col, curDf) != None:
			valName = xls_parsing_functions.find_official_column_name(numericColumnCorrespondenceDict, col, curDf)
			numericFieldSkeleton = numericAnnotationTemplate
			numericFieldSkeleton['value'] = row[col]
			numericAnnotations[valName] = numericFieldSkeleton
		elif xls_parsing_functions.find_official_column_name(stringColumnCorrespondenceDict, col, curDf) != None:
			valName = xls_parsing_functions.find_official_column_name(stringColumnCorrespondenceDict, col, curDf)
			stringFieldSkeleton = stringAnnotationTemplate
			stringFieldSkeleton['value'] = row[col]
			stringAnnotations[valName] = stringFieldSkeleton
		else:
			valName = col
			otherFieldSkeleton = otherFieldTemplate
			otherFieldSkeleton['value'] = row[col]
			otherFields[valName] = otherFieldSkeleton
			
	variant['coreAnnotationFields']['infoFields'] = infoFields
	variant['coreAnnotationFields']['numericAnnotations'] = numericAnnotations
	variant['coreAnnotationFields']['stringAnnotations'] = stringAnnotations
	variant['coreAnnotationFields']['otherFields'] = otherFields
	return variant

#init the metadata component of the variant structure
def init_variant_metadata_structure(variant, sheetName):
	variantMetadataStruct = {'metrics': '', 'workflow': ''}
	metricsDict = {'numTimesClicked': ''}
	workflowDict = {'curationMode': sheetName, 'freeTextNotes': 'enter any notes here'}
	variantMetadataStruct['metrics'] = metricsDict
	variantMetadataStruct['workflow'] = workflowDict
	return variantMetadataStruct

#testing function that pretty prints the json structure
def json_pretty_print_struct(jsonFile):
	parsed = json.loads(jsonFile)
	print json.dumps(parsed, indent=4, sort_keys=True)

def write_json_file(filename, parsedJson):
	jsonFile = open(filename, 'w+')
	jsonFile.write(json.dumps(parsedJson))

#--------------------MAIN CODE-------------------------------

#test code for sorting data by specified value
inputXls = sys.argv[1] 
sheetDict = xls_parsing_functions.read_xls_sheets(inputXls)
xls = pd.ExcelFile(inputXls)
sheetNames = xls.sheet_names
jsonData = []
for sheetName in sheetNames:
	for index, row in sheetDict[sheetName].iterrows():
		curVariant = convert_df_row_to_json(row, sheetDict[sheetName])
		#set the metadata
		curVariant['metadata'] = init_variant_metadata_structure(curVariant, sheetName)
		jsonData.append(curVariant)

#alert adjust the path based on the environment in which we are doing this
jsonFilename = 'visualization.json'
#jsonFilename = inputXls.strip('.xls') + '_visualization.json'
print 'writing json data to ', jsonFilename
write_json_file(jsonFilename, jsonData)
#json_pretty_print_struct(json.dumps(jsonData))

