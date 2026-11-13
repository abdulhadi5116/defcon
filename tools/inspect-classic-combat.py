"""Read-only v1.43 PE evidence. Requires pefile and capstone; never executes target code."""
import hashlib, json, struct, sys
from pathlib import Path
import pefile
from capstone import Cs, CS_ARCH_X86, CS_MODE_32, CS_OP_IMM, CS_OP_REG, CS_OP_MEM
path=Path(sys.argv[1] if len(sys.argv)>1 else '/tmp/defcon-v143-reference/defcon-unpacked.exe')
raw=path.read_bytes()
assert hashlib.sha256(raw).hexdigest()=='8169bbbbb364084dadea790a004a4595acc9549dfcc5fc9a12884d072e4615e2', 'Expected the supplied v1.43 unpacked executable'
p=pefile.PE(data=raw); base=p.OPTIONAL_HEADER.ImageBase
md=Cs(CS_ARCH_X86,CS_MODE_32);md.detail=True
registers={};values={};table=0x553748
for ins in md.disasm(p.get_data(0x468810-base,0x27e),0x468810):
    ops=ins.operands
    if ins.mnemonic=='xor' and len(ops)==2 and ops[0].reg==ops[1].reg:registers[ops[0].reg]=0
    if ins.mnemonic!='mov' or len(ops)!=2:continue
    value=ops[1].imm if ops[1].type==CS_OP_IMM else registers.get(ops[1].reg) if ops[1].type==CS_OP_REG else None
    if value is None:continue
    if ops[0].type==CS_OP_REG:registers[ops[0].reg]=value
    elif ops[0].type==CS_OP_MEM and table<=ops[0].mem.disp<table+14*14*4:values[ops[0].mem.disp]=value
print('SHA256',hashlib.sha256(raw).hexdigest())
print('Target rows / attacker columns 0..13, base 0x553748; lookup 0x468a8e')
print(json.dumps([[values.get(table+(target*14+attacker)*4,0) for attacker in range(14)] for target in range(14)]))
for name,address,length in [('Matrix',0x468810,0x29c),('Nuclear area damage',0x4648c9,0xe7),('Moving class predicate',0x46a5a0,0x27),('Nuclear intensity',0x455dd6,0x98),('Explosion decay',0x44a6c0,0x190),('Explosion draw',0x44a850,0x1f5)]:
    print('\n'+name+' '+hex(address))
    for ins in md.disasm(p.get_data(address-base,length),address):print(hex(ins.address),ins.mnemonic,ins.op_str)
print('\nReferenced double constants')
for address in [0x534128,0x534190,0x534288,0x5343f0,0x534470]:print(hex(address),struct.unpack('<d',p.get_data(address-base,8))[0])
