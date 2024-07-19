import { Address, BitString, Cell, beginCell, toNano } from '@ton/core';
import { Airdrop, AirdropEntry, generateEntriesDictionary } from '../wrappers/Airdrop';
import { compile, NetworkProvider } from '@ton/blueprint';
import { JettonMinter } from '../wrappers/JettonMinter';

export async function run(provider: NetworkProvider) {
    const entries: AirdropEntry[] = [
        {
            code: new BitString(Buffer.from('aaa'), 0, 256),
            amount: toNano('1'),
        },
        {
            code:  new BitString(Buffer.from('bbb'), 0, 256),
            amount: toNano('2'),
        },
        {
            code:  new BitString(Buffer.from('ccc'), 0, 256),
            amount: toNano('1.5'),
        },
    ];

    const dict = generateEntriesDictionary(entries);
    const dictCell = beginCell().storeDictDirect(dict).endCell();
    console.log(`Dictionary cell (store it somewhere on your backend: ${dictCell.toBoc().toString('base64')}`);
    const merkleRoot = BigInt('0x' + dictCell.hash().toString('hex'));
    console.log(merkleRoot)
    const jettonMinterAddress = Address.parse('EQAmeBDlFDr6T45yoAaYMk85xjI51ildO-vg9EM13g3WYwov');
    const jettonMinter = provider.open(JettonMinter.createFromAddress(jettonMinterAddress));

    const airdrop = provider.open(
        Airdrop.createFromConfig(
            {
                merkleRoot,
                helperCode: await compile('AirdropHelper'),
            },
            await compile('Airdrop')
        )
    );

    await airdrop.sendDeploy(provider.sender(), toNano('0.05'), await jettonMinter.getWalletAddressOf(airdrop.address));

    await provider.waitForDeploy(airdrop.address);

    // run methods on `airdrop`
}

console.log(toNano('1'))