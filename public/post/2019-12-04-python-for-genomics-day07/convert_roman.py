import my_module
import sys

#print(sys.argv)

if len(sys.argv) < 2:
    print('usage: roman [roman numeral]')
    exit()

roman_numeral = sys.argv[1]

#print(roman_numeral)

print(my_module.roman_to_arabic(roman_numeral))
