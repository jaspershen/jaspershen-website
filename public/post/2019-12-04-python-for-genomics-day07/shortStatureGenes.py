##########################################################
#
# The tab-delimited file shortStatureDisorders.tsv (on Canvas) contains:
#    (1) The name of a disorder that has short stature as a symptom
#    (2) The genes that are known to cause that disorder (separated by ' | ')
#
# Here are a few example lines from shortStatureDisorders.tsv
#    atelosteogenesis                         FLNB | SLC26A2
#    Bruton-type agammaglobulinemia           BTK
#    Legg-Calve-Perthes disease               COL2A1
#    spondylocarpotarsal synostosis syndrome  FLNB
#    Williams-Beuren syndrome                 ELN | MLXIPL
#    Weill-Marchesani syndrome                ADAMTS10 | ADAMTS17 | FBN1 | LTBP2
#    multiple pterygium syndrome              CHRNA1 | CHRND | CHRNG
#
# YOUR TASK: Find all the diseases associated with particular genes of interest specified by the user.
#
# Specify which genes you're interested in from the command line like this:
#     python shortStatureGenes.py FLNB WNT1 FGFR3 SOX9 FOXG1
#     python shortStatureGenes.py BMP1 COL1A1 SMARCB1
#
# Format your tab-delimited output file like this:
# gene   disorder1|disorder2
# i.e.
# FLNB	atelosteogenesis|spondylocarpotarsal synostosis syndrome|Larsen syndrome|Boomerang dysplasia
# WNT1	osteogenesis imperfecta type 15
# FGFR3	thanatophoric dysplasia|achondroplasia|SADDAN
# SOX9	campomelic dysplasia
# FOXG1	Rett syndrome
#
# The name of your output file should be the names of the genes of interest
# separated by an underscores
#     i.e. FLNB_FGFR_COL1A1_SMARCB1.tsv
# The name of the output file should NOT be input by the user in the command line or
#     hardcoded within your script.
#
##########################################################

# YOUR CODE HERE
