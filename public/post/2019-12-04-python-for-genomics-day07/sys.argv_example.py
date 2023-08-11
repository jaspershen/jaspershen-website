##############################
# Run this script by typing the following in Terminal (Mac) or MobaXterm (Windows)
# python sys.argv_example.py x y 7 8 9 10 11 12 13
#
# What happens when you type this?
# python sys.argv_example.py this is bios274 hello hi
##############################

import sys

a = sys.argv
b = sys.argv[0]
c = sys.argv[1]
d = sys.argv[2]
e = sys.argv[3]
f = sys.argv[3:]

print(a)
print(b)
print(c)
print(d)
print(e)
print(f)
