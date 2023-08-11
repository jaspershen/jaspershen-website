#######################################
#
# 1. Modify this script so that it can
#    find the sum of all the lines in any file
#    provided as a argument on the command line.
#
#    Use the function sum_list_of_strings() from utils.py!
#
#    i.e. Modify this script so you can find the sum of the lines
#         in sample1.txt, sample2.txt, and sample3.txt by
#         doing the following:

#         python sumLinesOfFile.py sample1.txt
#         python sumLinesOfFile.py sample2.txt
#         python sumLinesOfFile.py sample3.txt
#
#
# 2. Save the output of this script to a file name of your choosing.
#    This can be accomplished by:
#
#        a. modifying the code in this script
#             OR
#        b. keeping the code in this script the same but
#           modifying how you run the script from the command line
#
#######################################

with open(inFileName, 'r') as inFile:
    for line in inFile:
        line = line.strip().split('\t')
        SUM_to_print = sum_list_of_strings(line)
        print(SUM_to_print)
