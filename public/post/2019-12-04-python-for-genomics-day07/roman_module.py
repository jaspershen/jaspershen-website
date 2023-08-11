
def roman_to_arabic(string):
    '''
    Returns the integer value of a string in Roman numerals
    ''' 
    dictionary = {'M':1000, 'D':500, 'C':100, 'L':50, 'X':10, 'V':5, 'I':1}
    arabic = []

    # list that holds the Roman numerals as Arabic ciphers
    for letter in string.upper():
        if letter in dictionary:
            arabic.append(dictionary[letter])

    return sum(arabic)

