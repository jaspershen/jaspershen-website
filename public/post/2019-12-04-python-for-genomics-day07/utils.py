compDict = {'A':'T', 'T':'A', 'G':'C', 'C':'G'}

########################################

def sum_list_of_strings(myList):
    '''
    Input: A list of strings (i.e. ['1', '2', '3'])
    Output: The sum of the numbers in that string (i.e. 6)
    '''
    SUM = sum([int(x) for x in myList])
    return SUM

########################################

def comp(seq):
    seq_comp = ''.join([compDict[base] for base in seq])
    return seq_comp

########################################

def rev_comp(seq):
    revComp = comp(seq)[::-1]
    return revComp

########################################

def rev_comp_count(seq):
    countDict = {}

    # Reverse complement
    seq_revComp = rev_comp(seq)

    # Count number of bases
    for base in compDict:
        count = seq_revComp.count(base)
        countDict[base] = count

    return seq_revComp, countDict

########################################
