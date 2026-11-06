# LM Roman TT

The fonts of the CV as a PDF (src/components/cv/CvPdf.tsx). They are Latin Modern 2.004 by the GUST e-foundry
(https://www.gust.org.pl/projects/e-foundry/latin-modern), changed in two ways:

1. The CFF outlines were converted to TrueType outlines with fontTools (cu2qu): the PDF library subsets
   TrueType fonts, so a PDF embeds only the letters it uses (about 32 KB for a one-page CV).
2. They were subset to Latin scripts with fontTools, to keep the download small:
   `pyftsubset <font>.ttf --unicodes="U+0020-007E,U+00A0-024F,U+02C6-02DD,U+1E00-1EFF,U+2010-2027,U+2030-203A,U+2044,U+20AC,U+2122,U+2190-2193,U+2212" --layout-features="kern,liga,locl"`

The characters they cover are listed in src/lib/cv/fonts.ts, which warns about the others: update it when
these files change.

As the license requests for derived fonts, they are renamed:

| File | From |
|---|---|
| lmromantt-regular.ttf | lmroman10-regular.otf |
| lmromantt-bold.ttf | lmroman10-bold.otf |
| lmromantt-italic.ttf | lmroman10-italic.otf |
| lmromancapstt-regular.ttf | lmromancaps10-regular.otf |

License: GUST Font License (GUST-FONT-LICENSE.txt), that is the LaTeX Project Public License 1.3c.
