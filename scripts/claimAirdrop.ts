import {TonClient } from "ton"
import { Address, Cell, Dictionary } from '@ton/core';
import { airdropEntryValue } from '../wrappers/Airdrop';
import { NetworkProvider, compile } from '@ton/blueprint';
import { AirdropHelper } from '../wrappers/AirdropHelper';

import { KeyPair, mnemonicToPrivateKey } from 'ton-crypto';
import { getHttpEndpoint } from "@orbs-network/ton-access";

export async function run(provider: NetworkProvider) {
    // suppose that you have the cell in base64 form stored somewhere
    const dictCell = Cell.fromBase64(
        'te6cckEBBQEAgAACA8/oAgEASkY2NjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABFloLwACASAEAwBJGJiYgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAR3NZQAgBJGFhYQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQ7msoAtEX9XQ='
    );
    const dict = dictCell.beginParse().loadDictDirect(Dictionary.Keys.BigUint(256), airdropEntryValue);

    const entryIndex = 1n;

    const proof = dict.generateMerkleProof(entryIndex);

    const helper = provider.open(
        AirdropHelper.createFromConfig(
            {
                airdrop: Address.parse('EQAya8d6uJkm7c_moq8o9fqvtkPP3sz6YirYZoUVAkyVogHj'),
                index: entryIndex,
                proofHash: proof.hash(),
            },
            await compile('AirdropHelper')
        )
    );
    console.log(123)
    if (!(await provider.isContractDeployed(helper.address))) {
        await helper.sendDeploy(provider.sender());
        await provider.waitForDeploy(helper.address);
    }
    console.log(234)
    await helper.sendClaim(123n, proof, provider.sender().address || Address.parse("")); // 123 -> any query_id
}
