/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class VehicleTransfer extends Contract {

    // AssetExists returns true when asset with given VID exists in world state.
    async AssetExists(ctx, vid) {
        const assetJSON = await ctx.stub.getState(vid);
        return assetJSON && assetJSON.length > 0;
    }
    
    // CreateVehicle issues a new asset to the world state with given details.
    async CreateVehicle(ctx, vid, make, model, year, ownershipHistory, accidentHistory) {
        
        // Validate if a Vehicle (VID) exist on the world state or not
        const exists = await this.AssetExists(ctx, vid);
        if (exists) {
            throw new Error(`The Vehicle ${vid} already exists`);
        }

        const asset = {
            VID: vid,
            Make: make,
            Model: model,
            Year: year,
            OwnershipHistory: ownershipHistory,
            AccidentHistory: accidentHistory

        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(vid, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given VID.
    async ReadAsset(ctx, vid) {
        const assetJSON = await ctx.stub.getState(vid); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${vid} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, vid, make, model, year, ownershipHistory, accidentHistory) {
        const exists = await this.AssetExists(ctx, vid);
        if (!exists) {
            throw new Error(`The asset ${vid} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            VID: vid,
            Make: make,
            Model: model,
            Year: year,
            OwnershipHistory: ownershipHistory,
            AccidentHistory: accidentHistory
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(id, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, vid) {
        const exists = await this.AssetExists(ctx, vid);
        if (!exists) {
            throw new Error(`The asset ${vid} does not exist`);
        }
        return ctx.stub.deleteState(vid);
    }

    // TransferAsset updates the owner field of asset with given id in the world state.
    async TransferAsset(ctx, vid, newOwner) {
        const assetString = await this.ReadAsset(ctx, vid);
        const asset = JSON.parse(assetString);
        const oldOwner = asset.Owner;
        asset.Owner = newOwner;
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(vid, Buffer.from(stringify(sortKeysRecursive(asset))));
        return oldOwner;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllAssets(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = VehicleTransfer;
