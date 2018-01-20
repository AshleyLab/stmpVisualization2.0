//note this visualization is strongly indebted to the "better life snowflake" by paula fillipone (http://www.informationisbeautifulawards.com/showcase/155-the-better-life-snowflake)

//The number of numeric variant attributes  These form the rays of the variant visualization icon
int NUM_NUMERIC_VARIANT_ATTRIBUTES;
//space between each visualization of a numeric variant attribute
float NUMERIC_SEPARATION;
//The number of string attributes for the variant record.  These form the interior of the representation
int NUM_STRING_ATTRIBUTES;
//
int NUM_INFO_ATTRIBUTES;

int NUM_VARIANTS;

//IMPORTANT GLOBAL VARIABLES
String[] infoColumns;
String[] drawingColumns;
String[] nameColumns;
String[] colorColumns;
ArrayList<variantRecord>variantData;

//variables used in the deletion process
int curIdx = 0;

//Variant Representation Parameters
//scaling for the size of lines
int STEM_SIZE = 170;
int INNER_CIRCLE_RADIUS = 40;
int STRING_VAR_LEN = 50;
int NUMERIC_VAR_LEN = STEM_SIZE - STRING_VAR_LEN;
//coordinates for the center of the circle
int CX = 500;
int CY = 300;

float POPOUT_SCALE = 1.7;
int POPOUT_X0 = CX + 500;
int POPOUT_Y0 = CY + 200;
int POPOUT_BEZIER_LEN = 150;

color[] COLORS = {
/*light green*/ color(155, 247, 89),
/*light blue*/ color(26, 162, 255),
/*orange*/ color(255, 102,2),
/*purple*/ color(103, 87, 170),
/*dark blue*/ color(30, 30, 200),
/*yellow*/ color(240, 240, 0),
/*pink*/ color(250, 110, 100),
/*"indian red*/ color(140, 30, 30),
color(120, 200, 200), color(5, 200, 230), color(120, 200, 250)};

//for demo's sake, we rename the columns to be readable
String[] demoColNames = {"QUAL", "Max Allele Freq", "Conservation Score", "CADD Score", "Allele Depth", "Polyphen Score", "Exac Tolerance", "DP"};

int LINE_SCALING = INNER_CIRCLE_RADIUS/12;
//deterimines where the circle is rotated around
float INITIAL_THETA = PI;
//determines how much space is available for the help label
float THETA_SPACE = .45;


//where on the canvas do we draw the stuff
int X = 1300;
int Y = 600;

//delimiters
//refer to the stmpViz python script for details//the three sections of each line (variant info, numeric values, and string values [design as of 10.24])
String LINE_SECTION_DELIMETER = "\t";
//marks the limit between attributes within the same section
//note that this delimiter is considered a regex by java so we have to escape it with the double slash
String ATTRIBUTE_DELIMETER = "\\|";
//marks the limit between values within the same section
String VALUE_DELIMETER = ";";

PFont FONT_NORMAL;
PFont FONT_BOLD;

void setup(){
  //initiate the fonts
  String[] fontList = PFont.list();
  printArray(fontList);
  
  FONT_NORMAL = createFont("HelveticaNeue-Thin", 32);
  FONT_BOLD = createFont("HelveticaNeue-BoldItalic", 32);
  textFont(FONT_NORMAL);
  size(1300, 600);
  background(30, 30, 30);
  read_columns();
  variantData = read_data();
  //make sure we have an appropriate number of colors specified
  if(COLORS.length != NUM_NUMERIC_VARIANT_ATTRIBUTES){
    System.out.println("error improper number of colors specified");
  }
  NUM_VARIANTS = variantData.size();
  draw_full_variant_report(variantData);
}

//for example the phred score of the variant
class numericVariantAttribute{
  String label;
  float value;
  float drawingValue;
  //x,y coordinates for visualization and bounding boxes
  float x0;
  float x1;
  float y0;
  float y1;
  //add a variablw for overflow data or for explanation
  numericVariantAttribute(String l, float v, float dv){
    this.label = l;
    this.drawingValue = dv;
    this.value = v;
  }
  //assigns the coordinates for drawing the variant's representation
  void assign_coordinates(float cX, float cY, int idx){
    float normalizedLen = this.drawingValue;
    //you need to do "+1" otherwise we draw the two different values twice at 0 and 2pi
    float theta = idx*PI/((NUM_NUMERIC_VARIANT_ATTRIBUTES + 1)/2);
    this.x0 = cX + INNER_CIRCLE_RADIUS*cos(theta);
    this.y0 = cY + INNER_CIRCLE_RADIUS*sin(theta);
    this.x1 = this.x0 + LINE_SCALING*normalizedLen*cos(theta);
    this.y1 = this.y0 + LINE_SCALING*normalizedLen*sin(theta);
  }
}

class stringVariantAttribute{
  String label;
  //value is an integer--for binary is "it here or not attributes" (such as comes from mom vs comes from mom), the value is either 0 or 1.  For others, such as missense vs frameshift vs duplication, it maps to logic as specified by helper functions
  String value;
  int drawingIdx;
  //add a variablw for overflow data or for explanation
  stringVariantAttribute(String l, String v, int dIdx){
    this.label = l;
    this.value = v;
    this.drawingIdx = dIdx;
  }
}

class variantRecord{
  float x;
  float y;
  float scale;
  boolean isDeleted;
  //specific genomic information
  String[] infoAttributes;
  numericVariantAttribute[] numericAttributes;
  stringVariantAttribute[] stringVariantAttributes;
  variantRecord(float xi, float yi, float si){
    this.x = xi;
    this.y = yi;
    this.scale = si;
    numericAttributes = new numericVariantAttribute[NUM_NUMERIC_VARIANT_ATTRIBUTES];
    stringVariantAttributes = new stringVariantAttribute[NUM_STRING_ATTRIBUTES];
    infoAttributes = new String[NUM_INFO_ATTRIBUTES];
    isDeleted = false;
  }
}

//////////////////////////METHODS FOR READING INPUT DATA/////////////////////////////////
//helper method for reading lines of data containing variant info values
void read_variant_info(String variantInfoString, variantRecord variant){
  String[] values = variantInfoString.split(VALUE_DELIMETER);
  for(int i = 0; i < values.length; i++){
    variant.infoAttributes[i] = values[i];
  }
}

//helper method for reading lines of data containing numeric info values
void read_numeric_values(String numericValuesString, variantRecord variant){
  String[] values = numericValuesString.split(ATTRIBUTE_DELIMETER);
  for(int i = 0; i < values.length; i++){
    String[] vals = values[i].split(VALUE_DELIMETER);
    String label = vals[0];
    float value = float(vals[1]);
    float drawingValue = float(vals[2]);
    numericVariantAttribute nVal = new numericVariantAttribute(label, value, drawingValue);
    variant.numericAttributes[i] = nVal;
  }
}

//helper method for reading the string values of a line of input
void read_string_values(String stringValuesString, variantRecord variant){
  String[] values = stringValuesString.split(ATTRIBUTE_DELIMETER);
  for(int i = 0; i < values.length; i++){
    String[] vals = values[i].split(VALUE_DELIMETER);
    String label = vals[0];
    String value = "";
    int dIdx = 0;
    if(vals.length > 2){
      value = vals[1];
      dIdx = int(vals[2]);
    }
    stringVariantAttribute sVal = new stringVariantAttribute(label, value, dIdx);
    variant.stringVariantAttributes[i] = sVal;
  }
}

//split the color string from color columns, then turn it into an int and return it
//returns a size 3 array that represents R, G, B
int[] get_color_from_color_columns(int idx){
  String[] colorStrings = colorColumns[idx].split(";");
  int[]colors = new int[colorStrings.length];
  colors[0] = int(colorStrings[0]);
  colors[1] = int(colorStrings[1]);
  colors[2] = int(colorStrings[2]);
  return colors;
}
 
//-----------------------------Data reading functions----------------------------------------------//

//reads columns from the config file, assugns global variables to be equal to them
void read_columns(){
  String lines[];
  lines = loadStrings("Documents/Processing/STMP_VIZ/remoteDataMnt/config.txt");
  infoColumns = lines[1].split(",");
  NUM_INFO_ATTRIBUTES = infoColumns.length;
  drawingColumns = lines[2].split(",");
  NUM_NUMERIC_VARIANT_ATTRIBUTES = drawingColumns.length;
  nameColumns = lines[3].split(",");
  NUM_STRING_ATTRIBUTES = nameColumns.length;
  colorColumns = lines[4].split(",");
}

ArrayList<variantRecord> read_data(){
  String lines[];
  ArrayList<variantRecord>recordData = new ArrayList<variantRecord>();
  lines = loadStrings("Documents/Processing/STMP_VIZ/remoteDataMnt/outputFiles/1viz.txt");
  //lines = loadStrings("Documents/Processing/STMP_VIZ/offlineSample");
  //process the record data by iterating line by line through the input and calling associated helper methods
  variantRecord curVariant = new variantRecord(1,1,1);
  for(int i = 0; i < lines.length; i++){
    String line = lines[i];
    String [] attributes = line.split(LINE_SECTION_DELIMETER);
    read_variant_info(attributes[0], curVariant);
    read_numeric_values(attributes[1], curVariant);
    read_string_values(attributes[2], curVariant);
    recordData.add(curVariant);
    curVariant = new variantRecord(1,1,1);
  }
  return recordData;
}

//-----------------STATIC DRAWING FUNCTIONS---------------------------------------//

void draw_full_variant_report(ArrayList<variantRecord>data){
  //ALERT CHANGE THIS
  //WE NEED TO DEFINE A RATION BETWEEN numeric separation and variant stem length. get on this!
  NUMERIC_SEPARATION = 1.5*NUMERIC_VAR_LEN/NUM_NUMERIC_VARIANT_ATTRIBUTES;
  for(int i = 0; i < data.size(); i++){
    variantRecord variant = data.get(i);
    
    //the initial theta gives an offset that allows a means to label values 
    float theta = INITIAL_THETA + THETA_SPACE + i*(2*PI - THETA_SPACE)/(NUM_VARIANTS);
    
    if(variant.isDeleted == false){
      draw_clinvar_attrs(variant, CX, CY, theta, 0);
      draw_variant(variant, i, CX, CY, theta);
    }
    else{
      draw_variant(variant, i, CX, CY, theta);
      draw_deleted_variant(i, CX, CY);
    }
  }
  draw_legend_labels(CX, CY, INITIAL_THETA + THETA_SPACE, 1, 1);
  //demo_chr_arcs();
}

//draws a single variant 
void draw_variant(variantRecord variant, int idx, float cx, float cy, float theta){
  //get theta, which is important for determining where we draw out line from
  
  //float theta = idx*PI/((NUM_VARIANTS + 1)/2);
  
  float x0stem = cx + (INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*cos(theta);
  float y0stem = cy + (INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*sin(theta);
  draw_variant_stem(x0stem, y0stem, theta, 1, 0);
  float x0numeric = cx + (INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*cos(theta);
  float y0numeric = cy + (INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*sin(theta);
  int colorIdx = idx%COLORS.length;
  draw_numeric_variant_attrs(variant, x0numeric, y0numeric, theta, colorIdx, 1);
}

void draw_variant_stem(float x0, float y0, float theta, float scale, int mode){
  float x1 = x0 + scale*STEM_SIZE*cos(theta);
  float y1 = y0 + scale*STEM_SIZE*sin(theta);
  if(mode == 0){
    stroke(255,255,255, 40);
    strokeWeight(3*scale);
  }
  else if(mode == 1){
    x1 = x0 + scale*(STEM_SIZE+STRING_VAR_LEN)*cos(theta);
    y1 = y0 + scale*(STEM_SIZE+STRING_VAR_LEN)*sin(theta);
    stroke(255, 255, 255, 230);
    strokeWeight(.5*scale);
  }
  //draw deletion
  else if(mode == 2){
    float DELETION_LINE_WIDTH = 10;
    stroke(20, 20, 20, 230);
    strokeWeight(scale*DELETION_LINE_WIDTH);
    x1 = x0 + scale*(STEM_SIZE)*cos(theta);
    y1 = y0 + scale*(STEM_SIZE)*sin(theta);
  }
  line(x0, y0, x1, y1);
}

void draw_numeric_variant_attrs(variantRecord variant, float x0, float y0, float theta, int colorIdx, float scale){
  for(int i = 0; i < NUM_NUMERIC_VARIANT_ATTRIBUTES; i++){
    float radius = scale*variant.numericAttributes[i].drawingValue;
    float x = x0 + scale*NUMERIC_SEPARATION*i*cos(theta);
    float y = y0 + scale*NUMERIC_SEPARATION*i*sin(theta);
    noStroke();
    fill(COLORS[i]);
    //used as a flag--basically if its at large scale we exagerrate the ellpises
    if(scale > 1){radius *= 1.5;}
    ellipse(x, y, radius, radius);
  }
}

//draws labels for the legend
//these are curves that begin on the first circles of the first variant
//NOTE!! THERE IS AN UNACCEPTABLE RELIANCE ON MAGIC NUMBERS HERE! I WILL FIX IT!
void draw_legend_labels(float x0, float y0, float theta, float raidus, float scale){
  //move the initial x and ys away from the center
  x0 = x0 + (INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*cos(theta);
  y0 = y0 + (INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*sin(theta);
  strokeWeight(3);
  noFill();
  
  //draw the clinvar label which is different
  stroke(255, 255, 255, 200);
  beginShape();
  curveVertex(CX - 30, CY + 15);
  curveVertex(CX - 30, CY);
  curveVertex(CX - 400, CY);
  curveVertex(CX - 400, CY + 25);
  curveVertex(CX -400, CY+ 55);
  endShape();
  fill(255);
  textAlign(CENTER);
  textSize(10);
  text("Clinvar Status", CX -400, CY+ 40);
  
  for(int i = 0; i < NUM_NUMERIC_VARIANT_ATTRIBUTES; i++){
    //make the stroke the same color as the circle
    stroke(COLORS[i], 150);
    strokeWeight(4);
    noFill();
    float x = x0 + scale*NUMERIC_SEPARATION*i*cos(theta);
    float y = y0 + scale*NUMERIC_SEPARATION*i*sin(theta);
    
    //shapes the curves and determines their offsets
    //lots of magic numbers produce curves I am happy with
    float finalXOffset = (NUM_NUMERIC_VARIANT_ATTRIBUTES - i)*40 + pow((NUM_NUMERIC_VARIANT_ATTRIBUTES - i), 3)/10;
    float finalYOffset = (NUM_NUMERIC_VARIANT_ATTRIBUTES - i)*2;
    //shapes the bend of the curves
    float yBendingOffset = sqrt(5 + NUM_NUMERIC_VARIANT_ATTRIBUTES - i)*7;
    
    beginShape();
    curveVertex(x, y);
    curveVertex(x, y);
    curveVertex(x - 20, y + yBendingOffset);
    curveVertex(x - finalXOffset, y + 25);
    curveVertex(x - finalXOffset, y - 55 + finalYOffset);
    curveVertex(x - finalXOffset, y - 55 + finalYOffset);
    endShape();
    
    //write the text
    fill(255);
    textFont(FONT_BOLD);
    textSize(10);
    textAlign(RIGHT);
    //text is slightly above the final y offset location
    text(demoColNames[i], x - finalXOffset + 6, y - 60 + finalYOffset);
  }
}

void draw_variant_popout(){
  int idx = get_variant_idx_for_mouse_pos();
  curIdx = idx;
  variantRecord variant = variantData.get(idx);
  int chr = int(variant.infoAttributes[0]);
  //draw_chr_label(2, chr);
  draw_variant_stem(POPOUT_X0, POPOUT_Y0, -1*PI/2, POPOUT_SCALE, 1);
  draw_variant_details(variant, POPOUT_X0, POPOUT_Y0 - INNER_CIRCLE_RADIUS*POPOUT_SCALE, -1*PI/2, POPOUT_SCALE);
  draw_numeric_variant_attrs(variant, POPOUT_X0, POPOUT_Y0 - INNER_CIRCLE_RADIUS*POPOUT_SCALE, -1*PI/2, idx%COLORS.length, POPOUT_SCALE);
  draw_clinvar_attrs(variant, POPOUT_X0, POPOUT_Y0, -1*PI/2, 1);
  draw_variant_text_info(variant, POPOUT_X0, POPOUT_Y0, POPOUT_SCALE);
}

//draws the details for the variant popout
void draw_variant_details(variantRecord variant, float x0, float y0, float theta, float scale){
  draw_ref_alt_chrom_pos(variant, x0, y0, scale);
  for(int i = 0; i < NUM_NUMERIC_VARIANT_ATTRIBUTES; i++){
      float x = x0 + scale*NUMERIC_SEPARATION*i*cos(theta);
      float y = y0 + scale*NUMERIC_SEPARATION*i*sin(theta);
      stroke(230, 230, 230, 150);
      noFill();
      strokeWeight(2);
      int xFactor = 1;
      if(i%2 == 0){
        xFactor = -1;
      }
      
      //upper curve
      beginShape();
      curveVertex(x, y);
      curveVertex(x + xFactor, y);
      curveVertex(x + 90*xFactor, y);
      curveVertex(x + 125*xFactor, y - 15);
      curveVertex(x + POPOUT_BEZIER_LEN*xFactor, y + .5*scale*NUMERIC_SEPARATION);
      endShape();
      
      //lower curve
      beginShape();
      curveVertex(x, y);
      curveVertex(x + xFactor, y);
      curveVertex(x + 90*xFactor, y);
      curveVertex(x + 125*xFactor, y + 15);
      curveVertex(x + POPOUT_BEZIER_LEN*xFactor, y - .5*scale*NUMERIC_SEPARATION);
      endShape();
      
      numericVariantAttribute attribute = variant.numericAttributes[i];
      //text component
      
      //attribute label
      String tLabel = attribute.label;
      //TEMPORARY FIX FOR THE DEMO
      tLabel = demoColNames[i];
      
      int tLen = tLabel.length();
      textSize(10);
      fill(255);
      if(10*tLen > 180){
        textSize(180/tLen);
      }
      textAlign(CENTER);
      text(tLabel, x + 60*xFactor, y - 4);
      
      //attribute value
      String tValue = str(attribute.value);
      text(tValue, x + 130*xFactor, y + 10/2);
      
  }
}


void draw_variant_text_info(variantRecord variant, float x0, float y0, float scale){
  //CONSTANTS
  int X_OFFSET_FROM_CENTRAL_LINE = 20;
  int Y_OFFSET_BOTTOM = 40;
  int TEXT_SIZE = 12;
  textSize(TEXT_SIZE);
  
  textAlign(LEFT);
  fill(255);
  
  String clinvarLabel = variant.stringVariantAttributes[0].label;
  String clinvarValue = variant.stringVariantAttributes[0].value;
  String fsLabel = variant.stringVariantAttributes[2].label;
  String fsVal = variant.stringVariantAttributes[2].value;
  String efsLabel = variant.stringVariantAttributes[3].label;
  String efsVal = variant.stringVariantAttributes[3].value;
  
  text(clinvarLabel, x0 + X_OFFSET_FROM_CENTRAL_LINE, y0 - Y_OFFSET_BOTTOM);
  text("-----" + clinvarValue, x0 + X_OFFSET_FROM_CENTRAL_LINE, y0 - Y_OFFSET_BOTTOM + TEXT_SIZE);
  text(fsLabel, x0 + X_OFFSET_FROM_CENTRAL_LINE, y0 - Y_OFFSET_BOTTOM + 2*TEXT_SIZE);
  text("-----" + fsVal, x0 + X_OFFSET_FROM_CENTRAL_LINE, y0 - Y_OFFSET_BOTTOM + 3*TEXT_SIZE);
  text(efsLabel, x0 + X_OFFSET_FROM_CENTRAL_LINE, y0 - Y_OFFSET_BOTTOM + 4*TEXT_SIZE);
  text("-----" + efsVal, x0 + X_OFFSET_FROM_CENTRAL_LINE, y0 - Y_OFFSET_BOTTOM + 5*TEXT_SIZE);
}


void draw_clinvar_attrs(variantRecord variant, float cx, float cy, float theta, int mode){
   int dValClinvar =  variant.stringVariantAttributes[0].drawingIdx;
   //if its clinvar pathogenic, the entire line is white and thick and long
   float x0 = 0;
   float y0 = 0;
   float x1 = 0;
   float y1 = 0;
   if(mode == 0){
     strokeWeight(2);
     x1 = cx + cos(theta)*(INNER_CIRCLE_RADIUS + STRING_VAR_LEN);
     y1 = cy + sin(theta)*(INNER_CIRCLE_RADIUS + STRING_VAR_LEN);
   }
   else if(mode == 1){
     strokeWeight(15);
     x0 = cx;
     y0 = cy;
     x1 = cx + cos(theta)*(INNER_CIRCLE_RADIUS);
     y1 = cy + sin(theta)*(INNER_CIRCLE_RADIUS);
   }
   
   //CONSTANTS for clinvar representations
   float CLINVAR_PATHOGENIC_LEN_OFFSET = 7;
   int CLINVAR_PATHOGENIC_COLOR = 255;
   float CLINVAR_LIKELY_PATHOGENIC_LEN_OFFSET = 35;
   int CLINVAR_LIKELY_PATHOGENIC_COLOR = 170;
   float CLINVAR_LIKELY_BENIGN_LEN_OFFSET = 55;
   int CLINVAR_LIKELY_BENIGN_COLOR = 40;
   
   if(dValClinvar == 0){
     stroke(CLINVAR_PATHOGENIC_COLOR);
     x0 = cx + CLINVAR_PATHOGENIC_LEN_OFFSET*cos(theta);
     y0 = cy + CLINVAR_PATHOGENIC_LEN_OFFSET*sin(theta);
   }
   else if(dValClinvar == 1){
       stroke(CLINVAR_LIKELY_PATHOGENIC_COLOR);
       x0 = cx + CLINVAR_LIKELY_PATHOGENIC_LEN_OFFSET*cos(theta);
       y0 = cy + CLINVAR_LIKELY_PATHOGENIC_LEN_OFFSET*sin(theta);
   }
   else if(dValClinvar == 2){
       stroke(CLINVAR_LIKELY_BENIGN_COLOR);
       x0 = cx + CLINVAR_LIKELY_BENIGN_LEN_OFFSET*cos(theta);
       y0 = cy + CLINVAR_LIKELY_BENIGN_LEN_OFFSET*sin(theta);
   }
   else{
       //dont draw anything
       return;
   }
   line(x0, y0, x1, y1);
}

void draw_additional_text_info(){

}

//////////////////////////////////////////////////////////////////////
void draw_ref_alt_chrom_pos(variantRecord variant, float x, float y, float scale){
  String chrom = variant.infoAttributes[0];
  String pos = variant.infoAttributes[1];
  String tRef = variant.infoAttributes[2];
  String tAlt = variant.infoAttributes[3];
  String gene = variant.infoAttributes[4];
  //to properly draw the ref and alt text we need to center the drawing
  int ltRef = tRef.length();
  int ltAlt = tAlt.length();
  //These need to be specified
  
  //CONSTANTS FOR THIS AREA
  int T_SIZE = 15;
  //how far apart are each line of text
  float INTRA_TEXT_OFFSET = T_SIZE*1.5;
  //how far words are from the line
  float CENTRAL_LINE_OFFSET = 5;
  
  textSize(T_SIZE);
  fill(255);
  textAlign(RIGHT);
  text(tRef, x - CENTRAL_LINE_OFFSET, y - scale*(STEM_SIZE) - CENTRAL_LINE_OFFSET);
  textAlign(LEFT);
  text(tAlt, x + CENTRAL_LINE_OFFSET, y - scale*(STEM_SIZE) - CENTRAL_LINE_OFFSET);
  textAlign(RIGHT);
  text(chrom, x - CENTRAL_LINE_OFFSET, y - scale*(STEM_SIZE) - INTRA_TEXT_OFFSET - CENTRAL_LINE_OFFSET);
  textAlign(LEFT);
  text(pos, x + CENTRAL_LINE_OFFSET, y - scale*(STEM_SIZE) - INTRA_TEXT_OFFSET - CENTRAL_LINE_OFFSET);
  textAlign(CENTER);
  text(gene, x, y - scale*(STEM_SIZE) - 2*INTRA_TEXT_OFFSET - CENTRAL_LINE_OFFSET);
}

void draw_name_and_pos(variantRecord variant, float x, float y){
  //MAGIC NUMBERS ALERT
  String geneName = variant.infoAttributes[4];
  textSize(8);
  fill(0);
  text(geneName, x - 2*geneName.length(), y - 20);
}

//helper methods--given a chromosome return the start and end angles of the chromosome
float get_start_angle(int chr){
  return PI/4;
}

float get_end_angle(int chr){
  return PI/2;
}

void demo_chr_arcs(){
  stroke(245, 245, 220, 150);
  strokeWeight(2);
  noFill();
  float startAngle = 3.7;
  float endAngle = 4.5;
  arc(CX, CY, 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), startAngle, endAngle);
  textSize(15);
  fill(255);
  text("CHR1", CX + 1.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*cos((startAngle + endAngle)/2), CY + 1.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*sin((startAngle + endAngle)/2));
  noFill();
  startAngle = 4.6;
  endAngle = 5.7;
  arc(CX, CY, 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), startAngle, endAngle);
  textSize(15);
  fill(255);
  text("CHR4", CX + 1.55*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*cos((startAngle + endAngle)/2), CY + 1.1*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*sin((startAngle + endAngle)/2));
  noFill();
  startAngle = 5.8;
  endAngle = 7.2;
  arc(CX, CY, 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), startAngle, endAngle);
  textSize(15);
  fill(255);
  text("CHR15", CX + 1.35*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*cos((startAngle + endAngle)/2), CY + 1.3*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*sin((startAngle + endAngle)/2));
  noFill();
  startAngle = 7.3;
  endAngle = 7.5;
  arc(CX, CY, 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), startAngle, endAngle);
  textSize(15);
  fill(255);
  text("CHR18", CX + 1.4*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*cos((startAngle + endAngle)/2), CY + 1.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*sin((startAngle + endAngle)/2));
  noFill();
  startAngle = 7.6;
  endAngle = 9.3;
  arc(CX, CY, 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), 2.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN), startAngle, endAngle);
  textSize(15);
  fill(255);
  text("CHR21", CX + 1.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*cos((startAngle + endAngle)/2), CY + 1.2*(STEM_SIZE + INNER_CIRCLE_RADIUS + STRING_VAR_LEN)*sin((startAngle + endAngle)/2));
  noFill();
  
}

void draw_chr_label(float scale, int chr){
  float startAngle = get_start_angle(chr);
  float endAngle = get_end_angle(chr);
  stroke(255);
  noFill();
  arc(CX, CY, scale*(STEM_SIZE + INNER_CIRCLE_RADIUS) + 50, scale*(STEM_SIZE + INNER_CIRCLE_RADIUS) + 50, startAngle, endAngle);
}

//draws the line that indicates deletion
void draw_deleted_variant(int i, float cx, float cy){
  float theta = INITIAL_THETA + THETA_SPACE + i*(2*PI - THETA_SPACE)/(NUM_VARIANTS);
  float x0stem = cx + INNER_CIRCLE_RADIUS*cos(theta);
  float y0stem = cy + INNER_CIRCLE_RADIUS*sin(theta);
  //in order to properly draw the deletion we need to set the scale slightly higher so that it reaches the edges
  //this happens because the line needs to cover the string variant attrs and variant stem
  //we need the 1.0 because of float compatibility
  float scale = 1.0*(STRING_VAR_LEN + STEM_SIZE)/STEM_SIZE;
  draw_variant_stem(x0stem, y0stem, theta, scale, 2);
}

void draw(){
  //background(231, 170, 170);
  background(30, 30, 30);
  //if you're interested draw a circle in the middle
  /*stroke(250, 250, 150);
  strokeWeight(4);
  fill(255, 255, 255, 0);
  ellipse(CX, CY, 15, 15);*/
  draw_full_variant_report(variantData);
  check_mouse();
}

//---------------Interactive Check Methods------------------------------//
void check_mouse(){
  if(mouse_in_circle()){
    draw_variant_popout();
  }
}

//answers a simple question: is the mouse inside the circle that defines the variant report 
boolean mouse_in_circle(){
  float radius = STEM_SIZE + INNER_CIRCLE_RADIUS;
  float dx = pow(pow(mouseX - CX, 2) + pow(mouseY - CY, 2), .5); 
  if(dx < radius){
    return true;
  }
  else{
    return false;
  }
}

int get_variant_idx_for_mouse_pos(){
  //we need to define our x and y coordinates in terms of proximity to the center of the circle
  float mX = mouseX - CX;
  //note that the order is different--because of how the coordinates are set up
  float mY = CY - mouseY;
  //trig! find out the angle by using arctangent
  float theta = atan(mY/mX);
  //note that there is an added complication in that java doesn't report angles according to the unit circle
  //we solve this with if statements
  //note that this is not done with the processing X Y coordinates, it is done with the assumption of a unit circle
  
  if(mX > 0 && mY >0){
    theta = 2*PI - theta;
  }
  
  if(mX < 0 && mY > 0){
    theta = PI + abs(theta);
  }
  //3rd quadrant
  if(mX < 0 && mY < 0){
    theta = 5*PI/2 + (PI/2 - theta);
  }
  if(mX > 0 && mY < 0){
    theta = 2*PI + abs(theta);
  }
  //next we find the index of the line in question by solving an adjusted form of the equation that draws lines based on the index
  int i = round(((theta - THETA_SPACE - INITIAL_THETA)*(NUM_VARIANTS))/(2*PI - THETA_SPACE));
  if(i >= NUM_VARIANTS){
    return NUM_VARIANTS - 1;
  }
  if(i < 0){
    return 0;
  }
  return i;
}

//delete the variant if you click the proper spot
void mouseClicked(){
  //fix this so that it makes the proper note
  if(mouseX > 100){
    variantData.get(curIdx).isDeleted = true;
  }
}