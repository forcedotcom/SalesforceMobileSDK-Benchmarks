/*
 * Copyright (c) 2017-present, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

import {smartstore, net,  forceUtil} from 'react-native-force';

// Promised based bridge functions for more readable tests
getDatabaseSize = forceUtil.promiser(smartstore.getDatabaseSize);
registerSoup = forceUtil.promiser(smartstore.registerSoup);
soupExists = forceUtil.promiser(smartstore.soupExists);
removeSoup = forceUtil.promiser(smartstore.removeSoup);
getSoupSpec = forceUtil.promiser(smartstore.getSoupSpec);
getSoupIndexSpecs = forceUtil.promiser(smartstore.getSoupIndexSpecs);
upsertSoupEntries = forceUtil.promiser(smartstore.upsertSoupEntries);
retrieveSoupEntries = forceUtil.promiser(smartstore.retrieveSoupEntries);
querySoup = forceUtil.promiser(smartstore.querySoup);
runSmartQuery = forceUtil.promiser(smartstore.runSmartQuery);
removeFromSoup = forceUtil.promiser(smartstore.removeFromSoup);
clearSoup = forceUtil.promiser(smartstore.clearSoup);
getAllStores = forceUtil.promiser(smartstore.getAllStores);
getAllGlobalStores = forceUtil.promiser(smartstore.getAllGlobalStores);
removeStore = forceUtil.promiser(smartstore.removeStore);
removeAllStores = forceUtil.promiser(smartstore.removeAllStores);
removeAllGlobalStores = forceUtil.promiser(smartstore.removeAllGlobalStores);

const selectSoup = "X1_Custom_Perf_Select";
const insertSoup = "X1_Custom_Perf_Insert";
const updateSoup = "X1_Custom_Perf_Update";
const randomData = ["Quinten", "Gayle", "Sheridan", "Albina", "Marianne", "Avon", "Cambridgeshire", "Buckinghamshire",
    "Cambridgeshire", "South Deborah", "faker[parts[0]][parts[1]] is not a function",
    "ba66e370-be9c-4079-bef2-67bcc085aaa6", "cd5d2363-d428-45fc-ad23-5d47b9411ea4", "amos", "van", "haleigh",
    "I'll back up the bluetooth FTP feed, that should feed the SAS matrix!",
    "copying the microchip won't do anything, we need to parse the virtual COM pixel!",
    "If we navigate the bandwidth, we can get to the SCSI hard drive through the open-source SMTP interface!",
    "Use the back-end HDD matrix, then you can input the neural monitor!"];

async function selectBenchmark(global, querySpec) {
    var before = Date.now();
    return querySoup(false, selectSoup, querySpec)
        .then((queryResult) => {
            var after = Date.now();
            var time = (after - before) / 1000;
            return time;
        })
        .catch((error) => {
            console.log("\n\nquery error: " + error);
        });
}

async function insertBenchmark(numEntries) {
    return clearSoup(false, insertSoup)
        .then(() => {
            const x1data = require('./X1_Custom_Perf.json');
            var insertData = x1data.records.slice(0, numEntries);

            let before = Date.now();
            return upsertSoupEntries(false, insertSoup, insertData)
                .then(() => {
                    let after = Date.now();
                    let time = (after - before) / 1000;
                    return time;
                });
        });
}

async function updateBenchmark(fields, rows) {
    // TODO
}

function createSoups() {
    soupExists(false, selectSoup)
    .then((exists) => {
        if(!exists) {
            createX1Soup(selectSoup);
            createX1Soup(insertSoup);
            createX1Soup(updateSoup);
        }
    })
    .catch((error) => { console.log("error checking if soup exists: " + error) });
}

function createX1Soup(soupName) {
    registerSoup(false, soupName,
    [
        { path:"attributes", type: "json1"},
        { path:"AccountId__c", type: "string"},
        { path:"Age__c", type: "string"},
        { path:"CaseId__c", type: "string"},
        { path:"Comments__c", type: "string"},
        { path:"ConnectionReceivedId", type: "string"},
        { path:"ConnectionSentId", type: "string"},
        { path:"ContactId__c", type: "string"},
        { path:"Cost__c", type: "integer"},
        { path:"CreatedById", type: "string"},
        { path:"CreatedDate", type: "string"},
        { path:"CurrencyIsoCode", type: "string"},
        { path:"Email__c", type: "string"},
        { path:"Id", type: "string"},
        { path:"IsDeleted", type: "string"},
        { path:"IsLocked", type: "string"},
        { path:"LastModifiedById", type: "string"},
        { path:"LastModifiedDate", type: "string"},
        { path:"LastReferencedDate", type: "string"},
        { path:"LastViewedDate", type: "string"},
        { path:"LeadId__c", type: "string"},
        { path:"MayEdit", type: "string"},
        { path:"Name", type: "string"},
        { path:"OppId__c", type: "string"},
        { path:"OwnerId", type: "string"},
        { path:"Percent__c", type: "floating"},
        { path:"Phone__c", type: "string"},
        { path:"SystemModstamp", type: "string"},
        { path:"Type__c", type: "string"}]
    )
    .then(() => {
        const x1data = require('./X1_Custom_Perf.json').records;
        upsertSoupEntries(false, soupName, x1data)
        .catch((error) => {
            console.log("Populating soup '" + soupName + "' failed with error: " + error);
        });
    })
    .catch((error) => {
        console.log("Soup creation for '" + soupName + "' failed with error: " + error);
    });
}

function buildQuery(type, indexPath, beginKey, endKey, exactKey, matchKey, likeKey, order, orderPath, pageSize, selectedPaths, queryLimit) {
    var querySpec;
    switch(type) {
        case 'all':
            querySpec = smartstore.buildAllQuerySpec(indexPath, order, pageSize, selectedPaths);
            break;
        case 'exact':
            querySpec = smartstore.buildExactQuerySpec(indexPath, exactKey, pageSize, order, orderPath, selectedPaths);
            break;
        case 'match':
            querySpec = smartstore.buildMatchQuerySpec(indexPath, matchKey, order, pageSize, orderPath, selectedPaths);
            break;
        case 'range':
            querySpec = smartstore.buildRangeQuerySpec(indexPath, beginKey, endKey, order, pageSize, orderPath, selectedPaths);
            break;
        case 'like':
            querySpec = smartstore.buildLikeQuerySpec(indexPath, likeKey, order, pageSize, orderPath, selectedPaths);
            break;
    }

    querySpec.limit = queryLimit;
    return querySpec;
}
export default {
    createSoups,
    insertBenchmark,
    selectBenchmark,
    updateBenchmark,
    buildQuery
};