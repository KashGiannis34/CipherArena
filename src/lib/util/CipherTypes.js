export const cipherTypes = {
    'Aristocrat' : {'directMap':true, 'keys':['!'], 'addOn':'freqTable', 'spacing':-1, 'length':[70, 130], 'options':['K',"!Random","1","2","3"]}, //! means no frontend visibility
    'Patristocrat' : {'directMap':true, 'keys':['!'], 'addOn':'freqTable', 'spacing':5, 'length':[70, 130], 'options':['K',"!Random","1","2","3"]},
    'Porta' : {'directMap':false, 'keys':['The key'], 'addOn':'', 'spacing':5, 'length':[30, 70], 'options':["Solve", "!Decode", "!Encode"]},
    'Atbash' : {'directMap':false, 'keys':[], 'addOn':'', 'spacing':-1, 'length':[60, 110], 'options':["Solve", "!Decode", "!Encode"]},
    'Caesar' : {'directMap':false, 'keys':[], 'addOn':'', 'spacing':-1, 'length':[60, 110], 'options':[]},
}