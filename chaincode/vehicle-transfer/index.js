/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const vehicleTransfer = require('./lib/vehicleTransfer');

module.exports.AssetTransfer = vehicleTransfer;
module.exports.contracts = [vehicleTransfer];