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

import React from 'react';
import {
    Text,
    TextInput,
    View,
    ScrollView,
    Platform,
} from 'react-native';

import {Picker} from "native-base";

import { createStackNavigator } from 'react-navigation';

import {
    Slider,
    Card,
    CheckBox,
    ButtonGroup,
    PricingCard
} from 'react-native-elements';
import storeMgr from './StoreMgr';
const ascendingButtons = ['ascending', 'descending'];

class BenchmarkScreen extends React.Component {
    static navigationOptions = {
        title: 'SmartStore Benchmark App'
    };

    constructor(props) {
        super(props);
        this.state = {
            selectedOperationIndex: 0,
            uiColor: '#4f9deb',
            
            // Query
            buildSpec: "all",
            selectedPaths: null,
            indexPath: null,
            beingKey: '',
            endKey: '',
            exactKey: '',
            matchKey: '',
            likeKey: '',
            orderPath: '',
            pageSize: 10,
            queryLimit: 750,
            ascendingIndex: 0,
            useCustomQuery: false,

            // Insert
            freshDatabase: true,
            insertRows: 150,

            // Update
            updateFields: 5,
            updateRows: 5,

            running: false,
            result: "0.00"};
        this.updateOperationIndex = this.updateOperationIndex.bind(this);
        this.udpateAscendingIndex = this.udpateAscendingIndex.bind(this);
        storeMgr.createSoups();
    }

    updateOperationIndex(selectedOperationIndex) {
        this.setState({selectedOperationIndex});
    }

    dynamicColor = function() {
        return {
            color: this.state.uiColor
        }
    };

    udpateAscendingIndex(ascendingIndex) {
        this.setState({ascendingIndex})
    }

    updateBuildSpec(buildSpec) {
        this.setState({buildSpec});
    }

    runBenchmark() {
        this.state.running = true;
        
        switch(this.state.selectedOperationIndex) {
            case 0:
                this.runSelectBenchmark();
                break;
            case 1:
                this.runInsertBenchmark();
                break;
            case 2:
                this.runUpdateBenchmark();
                break;
        }
    }

    async runSelectBenchmark() {
        let selectedPaths = JSON.parse('["attributes","AccountId__c","Age__c","CaseId__c","Comments__c","ConnectionReceivedId","ConnectionSentId","ContactId__c","Cost__c","CreatedById","CreatedDate","CurrencyIsoCode","Email__c","Id","IsDeleted","IsLocked","LastModifiedById","LastModifiedDate","LastReferencedDate","LastViewedDate","LeadId__c","MayEdit","Name","OppId__c","OwnerId","Percent__c","Phone__c","SystemModstamp","Type__c"]');
        let querySpec = storeMgr.buildQuery(this.state.buildSpec, this.state.indexPath, this.state.beginKey, this.state.endKey,
            this.state.exactKey, this.state.matchKey, this.state.likeKey, ascendingButtons[this.state.ascendingIndex],
            this.state.orderPath, this.state.pageSize, selectedPaths, this.state.queryLimit);
        let benchPromise = storeMgr.selectBenchmark(false, querySpec);

        var resultsPromise = benchPromise.then((lastResult) => {
                this.state.running = false;
                this.setState({ result: lastResult.toString() });
            })
            .catch((error) => {
                console.log("Select Bench Failed: " + error);
            });

        await Promise.all(resultsPromise, benchPromise);
    }

    async runInsertBenchmark() {
        let benchPromise = storeMgr.insertBenchmark(this.state.insertRows);

        var resultsPromise = benchPromise.then((lastResult) => {
            this.state.running = false;
            this.setState({ result: lastResult.toString()});
            this.setState({ platformResultsString: ("Native " + Platform.OS() + " results: " + lastResult.toString + " seconds.") });
        })
        .catch((error) => {
            console.log("Insert Bench Failed: " + error);
        });

        await Promise.all(resultsPromise, benchPromise);
    }

    async runUpdateBenchmark() {
        let benchPromise = storeMgr.updateBenchmark(this.state.updateFields, this.state.updateRows);

        var resultsPromise = benchPromise.then((lastResult) => {
            this.state.running = false;
            this.setState({ result: lastResult.toString()});
        })
            .catch((error) => {
                console.log("Update Bench Failed: " + error);
            });

        await Promise.all(resultsPromise, benchPromise);
    }

    test() {
        return (<TextInput
            style={{height: 40, borderColor: 'gray', borderWidth: 1}}
            value={this.state.queryInput}
            defaultValue={this.state.buildSpec}
        />);
    }

    render() {
        const operationButtons = ['Select', 'Insert', 'Update'];
        const { selectedOperationIndex } = this.state;

        return (
             <View style={{ flex: 1 }}>
                <ButtonGroup
                    onPress={this.updateOperationIndex}
                    selectedIndex={selectedOperationIndex}
                    buttons={operationButtons}
                />

                <ScrollView>
                {this.state.selectedOperationIndex == 0 &&
                <Card title={'Smart Query Builder'}>
                   

                    <Picker
                        placeholder="Select Query Spec Type"
                        placeholderStyle={this.state.uiColor}
                        mode="dropdown"
                        selectedValue={this.state.buildSpec}
                        onValueChange={this.updateBuildSpec.bind(this)}
                        >
                        <Picker.Item label="All Query Spec" value="all" />
                        <Picker.Item label="Exact Query Spec" value="exact" />
                        <Picker.Item label="Range Query Spec" value="range" />
                        <Picker.Item label="Like Query Spec" value="like" />
                        <Picker.Item label="Match Query Spec" value="match" />
                    </Picker>

                    {this.state.buildSpec == 'exact' &&
                    <TextInput
                        style={{height: 40, borderColor: 'gray', borderWidth: 1, padding: 10}}
                        onChangeText={(exactKey) => this.setState({exactKey})}
                        value={this.state.exactKey}
                    />}
                    {this.state.buildSpec == 'range' &&
                    <TextInput
                        style={{height: 40, borderColor: 'gray', borderWidth: 1, padding: 10}}
                        onChangeText={(beginKey) => this.setState({beginKey})}
                        value={this.state.beginKey}
                    />
                    }
                    {this.state.buildSpec == 'range' &&
                    <TextInput
                        style={{height: 40, borderColor: 'gray', borderWidth: 1, padding: 10}}
                        onChangeText={(endKey) => this.setState({endKey})}
                        value={this.state.endKey}
                    />
                    }
                    {this.state.buildSpec == 'like' &&
                    <TextInput
                        style={{height: 40, borderColor: 'grey', borderWidth: 1}}
                        onChangeText={(likeKey) => this.setState({likeKey})}
                        value={this.state.likeKey}
                    />}
                    {this.state.buildSpec == 'match' &&
                     <TextInput
                         style={{height: 40, borderColor: 'gray', borderWidth: 1}}
                         onChangeText={(matchKey) => this.setState({matchKey})}
                         value={this.state.matchKey}
                     />}

                    <Slider
                        value={this.state.pageSize}
                        onValueChange={(value) => this.setState({pageSize: value})}
                        minimumValue={1}
                        maximumValue={100}
                        step={1}
                    />
                    <Text>Page Size: {this.state.pageSize}</Text>

                    <Slider
                        value={this.state.queryLimit}
                        onValueChange={(value) => this.setState({queryLimit: value})}
                        minimumValue={0}
                        maximumValue={1000}
                        step={5}
                    />
                    <Text>Query Limit: {this.state.queryLimit}</Text>

                    <ButtonGroup style={this.state.uiColor}
                        onPress={this.udpateAscendingIndex}
                        selectedIndex={this.state.ascendingIndex}
                        buttons={ascendingButtons}
                    />
                </Card>
                }

                {this.state.selectedOperationIndex == 1 &&
                <Card title={'Insert Data'}>
                    <CheckBox
                        title='Use Empty Database'
                        checked={this.state.freshDatabase}
                        onPress={() => this.setState({ freshDatabase: !this.state.freshDatabase })}
                    />
                   <Slider
                        value={this.state.insertRows}
                        onValueChange={(value) => this.setState({insertRows: value})}
                        minimumValue={0}
                        maximumValue={1000}
                        step={5}
                    />
                    <Text>Number of Rows to Add: {this.state.insertRows}</Text>
                </Card>
                }
                </ScrollView>
                
                <PricingCard
                    color={this.state.uiColor}
                    title='Results'
                    price={this.state.result}
                    info={[]}
                    button={{ title: 'Run Benchmark', icon: 'build' }}
                    onButtonPress={() => this.runBenchmark()}
                />
            </View>
        );
    }
}

export const App = createStackNavigator({
    Home: { screen: BenchmarkScreen }
});