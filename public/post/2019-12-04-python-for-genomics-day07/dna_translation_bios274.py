#
# module of functions that translate a DNA sequence
#

DNA_codon_table = {
#                        Second Base
#        T             C             A             G
# T
    'TTT': 'Phe', 'TCT': 'Ser', 'TAT': 'Tyr', 'TGT': 'Cys',     # TxT
    'TTC': 'Phe', 'TCC': 'Ser', 'TAC': 'Tyr', 'TGC': 'Cys',     # TxC
    'TTA': 'Leu', 'TCA': 'Ser', 'TAA': '---', 'TGA': '---',     # TxA
    'TTG': 'Leu', 'TCG': 'Ser', 'TAG': '---', 'TGG': 'Trp',     # TxG
# C
    'CTT': 'Leu', 'CCT': 'Pro', 'CAT': 'His', 'CGT': 'Arg',     # CxT
    'CTC': 'Leu', 'CCC': 'Pro', 'CAC': 'His', 'CGC': 'Arg',     # CxC
    'CTA': 'Leu', 'CCA': 'Pro', 'CAA': 'Gln', 'CGA': 'Arg',     # CxA
    'CTG': 'Leu', 'CCG': 'Pro', 'CAG': 'Gln', 'CGG': 'Arg',     # CxG
# A
    'ATT': 'Ile', 'ACT': 'Thr', 'AAT': 'Asn', 'AGT': 'Ser',     # AxT
    'ATC': 'Ile', 'ACC': 'Thr', 'AAC': 'Asn', 'AGC': 'Ser',     # AxC
    'ATA': 'Ile', 'ACA': 'Thr', 'AAA': 'Lys', 'AGA': 'Arg',     # AxA
    'ATG': 'Met', 'ACG': 'Thr', 'AAG': 'Lys', 'AGG': 'Arg',     # AxG
# G
    'GTT': 'Val', 'GCT': 'Ala', 'GAT': 'Asp', 'GGT': 'Gly',     # GxT
    'GTC': 'Val', 'GCC': 'Ala', 'GAC': 'Asp', 'GGC': 'Gly',     # GxC
    'GTA': 'Val', 'GCA': 'Ala', 'GAA': 'Glu', 'GGA': 'Gly',     # GxA
    'GTG': 'Val', 'GCG': 'Ala', 'GAG': 'Glu', 'GGG': 'Gly'      # GxG
}

def translate_DNA_codon(codon):
    return DNA_codon_table[codon]

def translate(seq):
    '''Return the animo acid sequence corresponding to the DNA
    sequence seq'''
    translation = ''
    for n in range(0, len(seq) - (len(seq) % 3), 3): # every third base
        translation += translate_DNA_codon(seq[n:n+3])

    return translation


def translate_in_frame(seq, framenum):
    '''Return the translation of seq in framenum 1, 2, or 3'''

    return translate(seq[framenum-1:])


def print_translation_in_frame(seq, framenum, prefix):
    '''Print the translation of seq in framenum preceded by prefix'''
    print(prefix,
          framenum,
          ' ' * framenum,
          translate_in_frame(seq, framenum),
          sep='')


def print_translations(seq, prefix = ''):
    '''Print the translations of seq in all three reading frames,
    each preceded by prefix'''
    # print DNA sequence, indented to line up after prefix is added
    # to translation lines
    print('\n', ' ' * (len(prefix) + 2), seq, sep='')
    for framenum in range(1,4):
        print_translation_in_frame(seq, framenum, prefix)


def translate_with_open_reading_frames(seq, framenum):
    '''Return the translation of seq in framenum (1, 2, or 3), with
    ---'s when not within an open reading frame; assume the read is
    not in an open frame when at the beginning of seq'''
    open = False
    translation = ""
    seqlength = len(seq) - (framenum - 1)
    for n in range(framenum-1, seqlength - (seqlength % 3), 3):
        codon = translate_DNA_codon(seq[n:n+3])
        open = (open or codon == "Met") and not (codon == "---")
        translation += codon if open else "---"

    return translation


def print_translation_with_open_reading_frame(seq, framenum, prefix):
    print(prefix,
          framenum,
          ' ' * framenum,
          translate_with_open_reading_frames(seq, framenum),
          sep='')


def print_translations_with_open_reading_frames(seq, prefix=''):
    print('\n', ' ' * (len(prefix) + 2), seq, sep='')
    for frame in range(1,4):
        print_translation_with_open_reading_frame(seq, frame, prefix)


def print_translations_in_frames_in_both_directions(seq):
    print_translations(seq, '5\'->3\' ORF ')
    print_translations(seq[::-1], '3\'->5\' ORF ')


def print_translations_with_open_reading_frames_in_both_directions(seq):
    print_translations_with_open_reading_frames(seq, '5\'->3\' ORF ')
    print_translations_with_open_reading_frames(seq[::-1], '3\'->5\' ORF ')

