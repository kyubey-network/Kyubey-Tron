﻿component.data = function () {
    return {
        isMobileCandlestickFullScreen: false,
        sellOrders: [],
        maxAmountSellOrder: 0,
        maxAmountBuyOrder: 0,
        buyOrders: [],
        control: {
            order: 'mixed',
            markets: 'eos',
            trade: 'limit'
        },
        inputs: {
            pair: null,
            buyPrice: null,
            sellPrice: null,
            buyAmount: null,
            sellAmount: null,
            buyTotal: null,
            sellTotal: null,
            tokenSearchInput: ''
        },
        chart: {
            fullscreen: true,
            timezone: "Asia/Shanghai",
            container_id: "tv_chart_container",
            datafeed: new FeedBase(),
            library_path: "/js/candlestick/charting_library/",
            locale: app.lang,
            disabled_features: app.isMobile() ? ["header_indicators", "header_fullscreen_button", "left_toolbar", "control_bar", "timeframes_toolbar", "main_series_scale_menu", "symbol_search_hot_key", "header_symbol_search", "header_resolutions", "header_settings", "save_chart_properties_to_local_storage", "header_chart_type", "header_compare", "header_undo_redo", "header_screenshot", "use_localstorage_for_settings", "volume_force_overlay"] : ["left_toolbar", "control_bar", "timeframes_toolbar", "main_series_scale_menu", "symbol_search_hot_key", "header_symbol_search", "header_resolutions", "header_settings", "save_chart_properties_to_local_storage", "header_chart_type", "header_compare", "header_undo_redo", "header_screenshot", "use_localstorage_for_settings", "volume_force_overlay"],
            enabled_features: ["keep_left_toolbar_visible_on_small_screens", "side_toolbar_in_fullscreen_mode", "hide_left_toolbar_by_default", "left_toolbar", "keep_left_toolbar_visible_on_small_screens", "hide_last_na_study_output", "move_logo_to_main_pane", "dont_show_boolean_study_arguments"],
            custom_css_url: "chart.css",
            loading_screen: app.isMobile() ? {} : { backgroundColor: '#292929' },
            studies_overrides: {
                "volume.precision": 0
            },
            overrides: {
                "paneProperties.background": app.isMobile() ? "#ffffff" : "#292929",
                "paneProperties.vertGridProperties.color": "rgba(0,0,0,0)",
                "paneProperties.horzGridProperties.color": "rgba(0,0,0,0)",
                "scalesProperties.textColor": app.isMobile() ? "#333" : "#9194a4",
                volumePaneSize: "medium",
                "paneProperties.legendProperties.showStudyArguments": !0,
                "paneProperties.legendProperties.showStudyTitles": !0,
                "paneProperties.legendProperties.showStudyValues": !0
            },
            interval: 240,
            symbol: ''
        },
        mobile: {
            nav: 'summary',
            summaryActive: 'candlestick',
            exchangeMode: 'buy',
            delegateActive: 'current'
        },
        chartWidget: null,
        tokenId: '',
        account: '',
        baseInfo: {},
        showIntroduction: false,
        latestTransactions: [],
        favoriteList: [],
        buyPrecent: 0,
        sellPrecent: 0,
        openOrders: [],
        orderHistory: [],
        executeControl: {
            buy: 0,
            sell: 0
        },
        eosBalance: 0,
        tokenBalance: 0,
        appAccount: app.account,
        //views
        openOrdersView: null,
        histroyOrdersView: null,
        sellOrdersView: null,
        buyOrdersView: null,
        matchListView: null,
        tokenInfoView: null,
        favoriteListView: null,
        balanceView: null,
        buyAndSellStatus: true,
        pageTotal: 0,
        pageCount: 0,
        pageSize: 10,
        pageIndex: 1,
        jumpPage: '',
        favoriteObj: {},
        dexAddress: "TBVbLiQirADEdMsTL4WeTgNmMAgeoS16cF",
        dexContractAddress: "TK6EDrMUfiRcso1uR7rNBVDjHRayKPQMoA"
    };
};

component.created = function () {
    app.mobile.nav = null;
    this.tokenId = router.history.current.params.id;
    this.chart.symbol = this.tokenId;

    this.initCommonViews();

    this.getFavoriteList();

    if (app.isSignedIn) {
        this.initUserViews();
    }
};

component.methods = {
    initCommonViews() {
        this.getSellOrders();
        this.getBuyOrders();
        this.getMatchList();
        this.getTokenInfo();
    },
    initUserViews() {
        this.getBalances();
        this.getOpenOrders();
        this.getHistroyOrders();
    },
    delegateCallBack() {
        var self = this;
        this.delayRefresh(function () {
            self.refreshUserViews();
        });
    },
    cancelCallBack() {
        var self = this;
        this.delayRefresh(function () {
            self.refreshUserViews();
        });
    },
    doFavCallBack() {
        var self = this;
        this.delayRefresh(function () {
            self.getFavoriteList();
        });
    },
    refreshUserViews() {
        this.getBalances();
        this.openOrdersView.refresh();
        this.histroyOrdersView.refresh();
    },
    delayRefresh(callback) {
        setInterval(callback, 3000);
        setInterval(callback, 10000);
    },
    lcmTwoNumbers(x, y) {
        if ((typeof x !== 'number') || (typeof y !== 'number'))
            return false;
        return (!x || !y) ? 0 : Math.abs((x * y) / this.gcdTwoNumbers(x, y));
    },
    gcdTwoNumbers(x, y) {
        x = Math.abs(x);
        y = Math.abs(y);
        while (y) {
            var t = y;
            y = x % y;
            x = t;
        }
        return x;
    },
    //getExchangeAvailableValues(price, amount) {
    //    var tmp_p = parseFloat((price * 100000000).toFixed(0));

    //    var lcm = this.lcmTwoNumbers(tmp_p, 100000000);
    //    var min_available_count = lcm / tmp_p / 10000;
    //    var min_available_total = lcm / 100000000 / 10000;

    //    var availableAmount = parseInt((amount / min_available_count).toFixed(0)) * min_available_count;

    //    return {
    //        price: price,
    //        min_count: min_available_count,
    //        min_total: min_available_total,
    //        availableAmount: parseFloat((availableAmount).toFixed(app.precision.amount)),
    //        availableTotal: parseFloat((price * availableAmount).toFixed(app.precision.total))
    //    };
    //},
    dateObjToString: function (date) {
        return `${date.getFullYear()}/${(date.getMonth() + 1)}/${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} `;
    },
    initCandlestick: function (symbol) {
        var self = this;

        if ((typeof symbol === "undefined")) {
            symbol = this.tokenId;
        }

        this.chart.symbol = symbol;
        this.chartWidget = new window.TradingView.widget(this.chart);
        FeedBase.prototype.getBars = function (symbolInfo, resolution, rangeStartDate, rangeEndDate, onResult, onError) {
            self.getCandlestickData(symbol, new Date(rangeStartDate * 1000), new Date(rangeEndDate * 1000), self.chart.interval, function (apiResult) {
                var data = apiResult.data;
                if (data && Array.isArray(data)) {
                    var meta = { noData: false };
                    var bars = [];
                    if (data.length) {
                        for (var i = 0; i < data.length; i += 1) {
                            bars.push({
                                time: Number(new Date(data[i].time)),
                                close: data[i].closing,
                                open: data[i].opening,
                                high: data[i].max,
                                low: data[i].min,
                                volume: data[i].volume
                            });
                        }
                    } else {
                        meta = { noData: true };
                    }
                    onResult(bars, meta);
                }
            });
        }
    },
    getCandlestickData: function (tokenId, startDate, endDate, period, callback) {
        var _this = this;
        var begin = _this.dateObjToString(startDate);
        var end = _this.dateObjToString(endDate);
        qv.get(`/api/v1/lang/${app.lang}/token/${tokenId}/candlestick`, {
            begin: begin,
            end: end,
            period: period * 60
        }).then(x => {
            callback(x);
        });
    },
    exchangeCancel: function (token, type, id) {
        const $t = this.$t.bind(this);
        if (app.loginMode === 'Scatter Addons' || app.loginMode === 'Scatter Desktop') {
            this.scatterCancel(token, type, id);
        }
        else if (app.loginMode == "Simple Wallet") {
            app.startQRCodeCancelOrder(id, token, type == 'buy');
        }
    },
    scatterCancel: function (token, type, id) {
        var self = this;
        const { account, requiredFields, eos } = app;
        const $t = this.$t.bind(this);
        eos.contract('kyubeydex.bp', { requiredFields })
            .then(contract => {
                if (type === 'buy') {
                    return contract.cancelbuy(
                        account.name,
                        token,
                        id,
                        {
                            authorization: [`${account.name}@${account.authority}`]
                        });
                } else {
                    return contract.cancelsell(
                        account.name,
                        token,
                        id,
                        {
                            authorization: [`${account.name}@${account.authority}`]
                        });
                }
            })
            .then(() => {
                self.delayRefresh(self.refreshUserViews);
                showModal($t('tip_cancel_succeed'), $t('You can confirm the result in your wallet') + ',' + $t('Please contact us if you have any questions'));
            })
            .catch(error => {
                showModal($t('tip_cancel_failed'), error.message + $t('Please contact us if you have any questions'), "error");
            });
    },
    exchangeBuy() {
        const $t = this.$t.bind(this);

        var buySymbol = this.tokenId;
        var buyPrice = parseFloat(parseFloat(this.inputs.buyPrice).toFixed(app.precision.price));
        var buyAmount = parseFloat(parseFloat(this.inputs.buyAmount).toFixed(app.precision.amount));
        var buyTotal = parseFloat(parseFloat(this.inputs.buyTotal).toFixed(app.precision.total));

        //limit exchange input validate
        if (this.control.trade === 'limit') {
            if (buyTotal <= 0 || buyPrice <= 0 || buyAmount <= 0) {
                app.notification("error", $t('tip_correct_count'));
                return;
            }
            if (buyTotal > this.eosBalance) {
                app.notification("error", $t('tip_balance_not_enough'));
                return;
            }

            //var availableObj = this.getExchangeAvailableValues(buyPrice, buyAmount);
            //buyAmount = availableObj.availableAmount;
            //buyTotal = parseFloat(parseFloat(parseInt((buyTotal / availableObj.min_total).toFixed(0)) * availableObj.min_total).toFixed(app.precision.total));

            if (buyAmount == 0 || buyTotal == 0) {
                showModal($t('delegate_failed'), $t('tip_exchange_adjuct_zero', { price: buyPrice + "EOS", min_count: availableObj.min_count + buySymbol }), "error");
                return;
            }
        }
        //market exchange input validate
        else if (this.control.trade === 'market') {
            if (buyTotal <= 0) {
                app.notification("error", $t('tip_correct_count'));
                return;
            }
            if (buyTotal > this.eosBalance) {
                app.notification("error", $t('tip_balance_not_enough'));
                return;
            }
        }

        if (app.loginMode === 'Scatter Addons' || app.loginMode === 'Scatter Desktop') {
            this.scatterBuy(buySymbol, buyPrice, buyAmount, buyTotal);
        }
        else if (app.loginMode == "Simple Wallet") {
            $('#exchangeModal').modal('show');
            this.simpleWalletBuy(buySymbol, buyPrice, buyAmount, buyTotal);
        }
    },
    simpleWalletBuy(buySymbol, buyPrice, buyAmount, buyTotal) {
        var self = this;
        const $t = this.$t.bind(this);

        if (this.control.trade === 'limit') {
            var reqObj = this._getExchangeRequestObj(app.account.name, "kyubeydex.bp", buyTotal, "eosio.token", "TRX", 4, app.uuid, `${buyAmount.toFixed(app.precision.amount)} ${buySymbol}`);
            app.startQRCodeExchange($t('exchange_tip'), JSON.stringify(reqObj),
                [
                    {
                        color: 'green',
                        text: `${$t('exchange_buy')} ${buySymbol}`
                    },
                    {
                        text: `${$t('exchange_price')}: ${parseFloat(buyPrice).toFixed(app.precision.price)} TRX`
                    },
                    {
                        text: `${$t('exchange_amount')}: ${parseFloat(buyAmount).toFixed(app.precision.amount)} ${buySymbol}`
                    },
                    {
                        text: `${$t('exchange_total')}: ${parseFloat(buyTotal).toFixed(app.precision.total)} TRX`
                    }
                ]);
        }
        else if (this.control.trade === 'market') {
            var reqObj = this._getExchangeRequestObj(app.account.name, "kyubeydex.bp", buyTotal, "eosio.token", "EOS", 4, app.uuid, `0.0000 ${this.tokenId}`);
            app.startQRCodeExchange($t('exchange_tip'), JSON.stringify(reqObj),
                [
                    {
                        color: 'green',
                        text: `${$t('exchange_buy')} ${buySymbol}`
                    },
                    {
                        text: `${$t('exchange_total')}: ${parseFloat(buyTotal).toFixed(app.precision.total)} TRX`
                    }
                ]);
        }
    },
    isTRC20: function (symbol) {
        var trc20 = ["DEX", "PCB", "DRS", "RET", "DICE", "BET", "FUN", "GOC", "AB", "BFC", "WIN", "GAME", "TWJ", "ANTE", "6KPEN", "CFT", "VCOIN", "REY", "PLAY", "RING"];
        return trc20.includes(symbol);
    },
    getTRC20Address: function (symbol) {
        var addressObj = {
            "DEX": "TF6i3aPkvhQ7Whqa8UDs7VXVhtURasnAMk",
            "PCB": "TJzcEaqgYk9g4jZLEsB2DksLGikM4dWwYJ",
            "DRS": "TKBURAzYP6hwcRWBzqZvqww2PZuBm5Lev7",
            "RET": "TLCiRv2qn9tP3x59B3jtxuonyQzUHwNyUq",
            "DICE": "THvZvKPLHKLJhEFYKiyqj6j8G8nGgfg7ur",
            "BET": "TWGZ7HnAhZkvxiT89vCBSd6Pzwin5vt3ZA",
            "GOC": "TYe6uNj7jxkwy28yXeLPs6KDLZCuUjXvgd",
            "AB": "TNbYoP22d74RWy4ETssHsXYFrnmmbQ2fvt",
            "BFC": "TYUbxiksCwDyAfNcmirnCATZgb6hyrGbir",
            "WIN": "TBAo7PNyKo94YWUq1Cs2LBFxkhTphnAE4T",
            "GAME": "TYPHiHUiPBPCNvqBpzy1f7bdqrZ5r8e1K7",
            "TWJ": "TNq5PbSssK5XfmSYU4Aox4XkgTdpDoEDiY",
            "ANTE": "TCN77KWWyUyi2A4Cu7vrh5dnmRyvUuME1E",
            "6KPEN": "TCMjU3taxp19xNWMFQdQw45CYwQcqrsYqA",
            "CFT": "TSkG9SSKdWV5QBuTPN6udi48rym5iPpLof",
            "VCOIN": "TNisVGhbxrJiEHyYUMPxRzgytUtGM7vssZ",
            "REY": "TMWkPhsb1dnkAVNy8ej53KrFNGWy9BJrfu",
            "PLAY": "TYbSzw3PqBWohc4DdyzFDJMd1hWeNN6FkB",
            "RING": "TL175uyihLqQD656aFx3uhHYe1tyGkmXaW"
        }
        return addressObj[symbol];
    },
    async scatterBuy(buySymbol, buyPrice, buyAmount, buyTotal) {
        var self = this;
        const { account, requiredFields, eos } = app;
        const $t = this.$t.bind(this);


        if (this.control.trade === 'limit') {
            ////trc10
            //if (!self.isTRC20(this.tokenId)) {
            //    await tronWeb.trx.sendTrx(self.dexAddress, 1000000 * buyTotal);
            //}
            ////trc20
            //else {
            //    var contractAddress = self.getTRC20Address(self.tokenId);
            //    var contract = await tronWeb.contract().at(contractAddress);
            //    contract.transfer(self.dexAddress, 1000000 * buyTotal).send();
            //}
            await tronWeb.trx.sendTrx(self.dexAddress, 1000000 * buyTotal);
            var dexContract = await tronWeb.contract().at(self.dexContractAddress);
            await dexContract.exchange(1000000 * buyAmount, 1000000 * buyTotal, self.tokenId, "TRX").send();
            showModal($t('delegate_succeed'), $t('You can confirm the result in your wallet') + ',' + $t('Please contact us if you have any questions'));
            //var address = "TMWkPhsb1dnkAVNy8ej53KrFNGWy9BJrfu";
            //await tronWeb.trx.sendTrx("TPq7HbnLXuapW9oazU6Pqsrp1cduapZhj8", 100);
            //await tronWeb.trx.sendToken("TPq7HbnLXuapW9oazU6Pqsrp1cduapZhj8", 1, "REVOLUTION");

            //var contract = await tronWeb.contract().at(address);
            //contract.transfer("TPq7HbnLXuapW9oazU6Pqsrp1cduapZhj8", 100).send();

            //qv.get(`/api/v1/lang/${app.lang}/node/contract`, {
            //    address: address
            //}).then(contractObj => {

            //    var abiObj = [{ "constant": true, "name": "name", "outputs": [{ "type": "string" }], "type": 2, "stateMutability": 2 }, { "name": "approve", "inputs": [{ "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }], "outputs": [{ "type": "bool" }], "type": 2, "stateMutability": 3 }, { "constant": true, "name": "totalSupply", "outputs": [{ "type": "uint256" }], "type": 2, "stateMutability": 2 }, { "name": "transferFrom", "inputs": [{ "name": "from", "type": "address" }, { "name": "to", "type": "address" }, { "name": "value", "type": "uint256" }], "outputs": [{ "type": "bool" }], "type": 2, "stateMutability": 3 }, { "constant": true, "name": "decimals", "outputs": [{ "type": "uint8" }], "type": 2, "stateMutability": 2 }, { "name": "increaseAllowance", "inputs": [{ "name": "spender", "type": "address" }, { "name": "addedValue", "type": "uint256" }], "outputs": [{ "type": "bool" }], "type": 2, "stateMutability": 3 }, { "constant": true, "name": "balanceOf", "inputs": [{ "name": "owner", "type": "address" }], "outputs": [{ "type": "uint256" }], "type": 2, "stateMutability": 2 }, { "constant": true, "name": "symbol", "outputs": [{ "type": "string" }], "type": 2, "stateMutability": 2 }, { "name": "decreaseAllowance", "inputs": [{ "name": "spender", "type": "address" }, { "name": "subtractedValue", "type": "uint256" }], "outputs": [{ "type": "bool" }], "type": 2, "stateMutability": 3 }, { "name": "transfer", "inputs": [{ "name": "to", "type": "address" }, { "name": "value", "type": "uint256" }], "outputs": [{ "type": "bool" }], "type": 2, "stateMutability": 3 }, { "constant": true, "name": "allowance", "inputs": [{ "name": "owner", "type": "address" }, { "name": "spender", "type": "address" }], "outputs": [{ "type": "uint256" }], "type": 2, "stateMutability": 2 }, { "type": 1, "stateMutability": 3 }, { "name": "Transfer", "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "name": "value", "type": "uint256" }], "type": 3 }, { "name": "Approval", "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "name": "value", "type": "uint256" }], "type": 3 }];
            //    debugger;
            //    console.log(abiObj);
            //    const contract = tronWeb.contract(abiObj, "4137f3d3225bedabcc7e4a1");
            //    console.log(contract);
            //});
        }
        else if (this.control.trade === 'market') {
            eos.contract('eosio.token', { requiredFields })
                .then(contract => {
                    return contract.transfer(
                        account.name,
                        'kyubeydex.bp',
                        parseFloat(buyTotal).toFixed(app.precision.total) + ' TRX',
                        `0.0000 ${this.tokenId}`,
                        {
                            authorization: [`${account.name}@${account.authority}`]
                        });
                })
                .then(() => {
                    self.delayRefresh(self.refreshUserViews);
                    showModal($t('Transaction Succeeded'), $t('You can confirm the result in your wallet') + ',' + $t('Please contact us if you have any questions'));
                })
                .catch(error => {
                    self.handleScatterException(error, $t('Transaction Failed'));
                });
        }
    },
    handleScatterException(error, tipTitle) {
        const $t = this.$t.bind(this);
        if (typeof error === 'string') {
            error = JSON.parse(error)
        }
        if (error.error != null && error.error.code != null) {
            showModal(tipTitle, $t(error.error.what), "error");
        }
        else
            showModal(tipTitle, error.message + $t('Please contact us if you have any questions'), "error");
    },
    exchangeSell() {
        const $t = this.$t.bind(this);

        var sellSymbol = this.tokenId;
        var sellPrice = parseFloat(parseFloat(this.inputs.sellPrice).toFixed(app.precision.price));
        var sellAmount = parseFloat(parseFloat(this.inputs.sellAmount).toFixed(app.precision.amount));
        var sellTotal = parseFloat(parseFloat(this.inputs.sellTotal).toFixed(app.precision.total));

        //limit exchange input validate
        if (this.control.trade === 'limit') {
            if (sellAmount <= 0 || sellPrice <= 0 || sellTotal <= 0) {
                app.notification("error", $t('tip_correct_count'));
                return;
            }
            if (sellAmount > this.tokenBalance) {
                app.notification("error", $t('tip_balance_not_enough'));
                return;
            }

            //var availableObj = this.getExchangeAvailableValues(sellPrice, sellAmount);
            //sellAmount = availableObj.availableAmount;
            //sellTotal = parseFloat(parseFloat(parseInt((sellTotal / availableObj.min_total).toFixed(0)) * availableObj.min_total).toFixed(app.precision.total));

            if (sellAmount == 0 || sellTotal == 0) {
                showModal($t('delegate_failed'), $t('tip_exchange_adjuct_zero2', { price: sellPrice, min_count: availableObj.min_count + sellSymbol }), "error");
                return;
            }
        }
        //market exchange input validate
        else if (this.control.trade === 'market') {
            if (sellTotal <= 0) {
                app.notification("error", $t('tip_correct_count'));
                return;
            }
            if (sellTotal > this.tokenBalance) {
                app.notification("error", $t('tip_balance_not_enough'));
                return;
            }
        }

        if (app.loginMode === 'Scatter Addons' || app.loginMode === 'Scatter Desktop') {
            this.scatterSell(sellSymbol, sellPrice, sellAmount, sellTotal);
        }
        else if (app.loginMode == "Simple Wallet") {
            $('#exchangeModal').modal('show');
            this.simpleWalletSell(sellSymbol, sellPrice, sellAmount, sellTotal);
        }
    },
    simpleWalletSell(sellSymbol, sellPrice, sellAmount, sellTotal) {
        const $t = this.$t.bind(this);
        if (this.control.trade === 'limit') {
            var reqObj = this._getExchangeRequestObj(app.account.name, "kyubeydex.bp", sellAmount, this.baseInfo.contract.transfer, sellSymbol, 4, app.uuid, `${sellTotal.toFixed(app.precision.total)} EOS`);
            app.startQRCodeExchange($t('exchange_tip'), JSON.stringify(reqObj),
                [
                    {
                        color: 'red',
                        text: `${$t('exchange_sell')} ${sellSymbol}`
                    },
                    {
                        text: `${$t('exchange_sellprice')}: ${parseFloat(sellPrice).toFixed(app.precision.price)} EOS`
                    },
                    {
                        text: `${$t('exchange_sellamount')}: ${parseFloat(sellAmount).toFixed(app.precision.amount)} ${sellSymbol}`
                    },
                    {
                        text: `${$t('exchange_total')}: ${parseFloat(sellTotal).toFixed(app.precision.total)} EOS`
                    }
                ]);
        }
        else if (this.control.trade === 'market') {
            var reqObj = this._getExchangeRequestObj(app.account.name, "kyubeydex.bp", sellTotal, this.baseInfo.contract.transfer, sellSymbol, 4, app.uuid, `0.0000 EOS`);

            app.startQRCodeExchange($t('exchange_tip'), JSON.stringify(reqObj),
                [
                    {
                        color: 'red',
                        text: `${$t('exchange_sell')} ${sellSymbol}`
                    },
                    {
                        text: `${$t('exchange_total')}: ${parseFloat(sellTotal).toFixed(app.precision.total)} ${this.tokenId}`
                    }
                ]);
        }
    },
    async  scatterSell(sellSymbol, sellPrice, sellAmount, sellTotal) {
        var self = this;
        const { account, requiredFields, eos } = app;
        const $t = this.$t.bind(this);

        if (this.control.trade === 'limit') {
            //trc10
            if (!self.isTRC20(this.tokenId)) {
                await tronWeb.trx.sendToken(self.dexAddress, sellAmount, sellSymbol);
            }
            //trc20
            else {
                var contractAddress = self.getTRC20Address(self.tokenId);
                var contract = await tronWeb.contract().at(contractAddress);
                await contract.transfer(self.dexAddress, 1000000 * sellAmount).send();
            }

            var dexContract = await tronWeb.contract().at(self.dexContractAddress);
            await dexContract.exchange(1000000 * sellTotal, 1000000 * sellAmount, "TRX", self.tokenId).send();

            showModal($t('delegate_succeed'), $t('You can confirm the result in your wallet') + ',' + $t('Please contact us if you have any questions'));
        }
        else if (this.control.trade === 'market') {
            eos.contract(this.baseInfo.contract.transfer, { requiredFields })
                .then(contract => {
                    return contract.transfer(
                        account.name,
                        'kyubeydex.bp',
                        sellTotal.toFixed(app.precision.total) + ' ' + sellSymbol,
                        `0.0000 EOS`,
                        {
                            authorization: [`${account.name}@${account.authority}`]
                        });
                })
                .then(() => {
                    self.delayRefresh(self.refreshUserViews);

                    showModal($t('Transaction Succeeded'), $t('You can confirm the result in your wallet') + ',' + $t('Please contact us if you have any questions'));
                })
                .catch(error => {
                    showModal($t('Transaction Failed'), error.message + $t('Please contact us if you have any questions'), "error");
                });
        }
    },
    _getExchangeSign: function (uuid) {
        return uuid;
    },
    _getExchangeRequestObj: function (from, to, amount, contract, symbol, precision, uuid, dappData) {
        var _this = this;
        var loginObj = {
            "protocol": "SimpleWallet",
            "version": "1.0",
            "dappName": "Kyubey",
            "dappIcon": `${app.currentHost}/img/KYUBEY_logo.png`,
            "action": "transfer",
            "from": from,
            "to": to,
            "amount": amount,
            "contract": contract,
            "symbol": symbol,
            "precision": precision,
            "dappData": dappData,
            "desc": `${symbol} exchange`,
            "expired": new Date().getTime() + (3 * 60 * 1000),
            "callback": `${app.currentHost}/api/v1/simplewallet/callback/exchange?uuid=${uuid}&sign=${_this._getExchangeSign(uuid)}`
        };
        return loginObj;
    },
    getSellOrders() {
        this.sellOrdersView = qv.createView(`/api/v1/lang/${app.lang}/token/${this.tokenId}/sell-order`, {}, 6000);
        this.sellOrdersView.fetch(res => {
            if (res.code === 200 && res.request.symbol === this.tokenId) {
                this.sellOrders = res.data || [];

                let minDelegateSellPrice = 0;
                let minDelegateSellPriceAmount = 0;

                let maxAmountSellOrder = 0;
                res.data.forEach(item => {
                    if (minDelegateSellPrice == 0 || minDelegateSellPrice > item.unitPrice) {
                        minDelegateSellPrice = item.unitPrice;
                        minDelegateSellPriceAmount = item.amount;
                    }

                    maxAmountSellOrder = Math.max(maxAmountSellOrder, item.amount)
                })
                this.maxAmountSellOrder = maxAmountSellOrder;
                //first bind
                if (this.inputs.buyPrice == null) {
                    this.inputs.buyPrice = minDelegateSellPrice.toFixed(app.precision.price);
                    if (this.isSignedIn) {
                        this.inputs.buyAmount = minDelegateSellPriceAmount.toFixed(app.precision.amount);
                        this.inputs.buyTotal = (minDelegateSellPrice * minDelegateSellPriceAmount).toFixed(app.precision.total);
                    }
                    else {
                        this.inputs.buyAmount = 0.0.toFixed(app.precision.amount);
                        this.inputs.buyTotal = 0.0.toFixed(app.precision.total);
                    }
                }
            }
        })
    },
    getBuyOrders() {
        this.buyOrdersView = qv.createView(`/api/v1/lang/${app.lang}/token/${this.tokenId}/buy-order`, {}, 6000);
        this.buyOrdersView.fetch(res => {
            if (res.code === 200 && res.request.symbol === this.tokenId) {
                this.buyOrders = res.data || [];

                let maxDelegateBuyPrice = 0;
                let maxDelegateBuyPriceAmount = 0;

                let maxAmountBuyOrder = 0;
                res.data.forEach(item => {
                    if (maxDelegateBuyPrice < item.unitPrice) {
                        maxDelegateBuyPrice = item.unitPrice;
                        maxDelegateBuyPriceAmount = item.amount;
                    }

                    maxAmountBuyOrder = Math.max(maxAmountBuyOrder, item.amount);
                })
                this.maxAmountBuyOrder = maxAmountBuyOrder;
                //first bind
                if (this.inputs.sellPrice == null) {
                    this.inputs.sellPrice = maxDelegateBuyPrice.toFixed(app.precision.price);
                    if (this.isSignedIn) {
                        this.inputs.sellAmount = maxDelegateBuyPriceAmount.toFixed(app.precision.amount);
                        this.inputs.sellTotal = (maxDelegateBuyPrice * maxDelegateBuyPriceAmount).toFixed(app.precision.total);
                    }
                    else {
                        this.inputs.sellAmount = 0.0.toFixed(app.precision.amount);
                        this.inputs.sellTotal = 0.0.toFixed(app.precision.total);
                    }
                }
            }
        })
    },
    getTokenInfo() {
        this.tokenInfoView = qv.createView(`/api/v1/lang/${app.lang}/token/${this.tokenId}`, {});
        this.tokenInfoView.fetch(res => {
            if (res.code === 200) {
                this.baseInfo = res.data || {};
            }
        });
    },
    setPublish(price, amount, total) {
        price = parseFloat(price).toFixed(app.precision.price);
        amount = parseFloat(amount).toFixed(app.precision.amount);
        total = parseFloat(total).toFixed(app.precision.total);
        this.inputs.buyPrice = price;
        this.inputs.sellPrice = price;
        if (this.isSignedIn) {
            // calculate buyTotal & buyAmount
            if (total > parseFloat(this.eosBalance)) {
                this.inputs.buyTotal = parseFloat(this.eosBalance).toFixed(app.precision.total);
                this.inputs.buyAmount = parseFloat(this.inputs.buyTotal / this.inputs.buyPrice).toFixed(app.precision.amount);
            } else {
                this.inputs.buyTotal = total;
                this.inputs.buyAmount = amount;
            }
            // calculate sellTotal & sellAmount
            if (amount > parseFloat(this.tokenBalance)) {
                this.inputs.sellAmount = parseFloat(this.tokenBalance).toFixed(app.precision.amount);
                this.inputs.sellTotal = parseFloat(this.inputs.sellAmount * this.inputs.sellPrice).toFixed(app.precision.total);
            } else {
                this.inputs.sellAmount = amount;
                this.inputs.sellTotal = total;
            }
        } else {
            this.inputs.buyAmount = '0.0000';
            this.inputs.sellAmount = '0.0000';
            this.inputs.buyTotal = '0.0000';
            this.inputs.sellTotal = '0.0000';
        }
    },
    getcolorOccupationRatio: function (nowTotalPrice, historyTotalPrice) {
        var now = parseFloat(nowTotalPrice);
        var history = parseFloat(historyTotalPrice);
        if (now > history) return "100%";
        return parseInt(now * 100.0 / history) + "%";
    },
    getMatchList() {
        this.matchListView = qv.createView(`/api/v1/lang/${app.lang}/token/${this.tokenId}/match`, {}, 6000);
        this.matchListView.fetch(res => {
            if (res.code === 200 && res.request.symbol === this.tokenId) {
                this.latestTransactions = res.data || [];
            }
        })
    },
    formatTime(time) {
        return moment(time + 'Z').format('YYYY-MM-DD HH:mm:ss')
    },
    formatShortTime(time) {
        return moment(time + 'Z').format('MM-DD HH:mm:ss')
    },
    getFavoriteList() {
        var self = this;
        const name = app.account ? app.account.name : null;
        this.favoriteListView = qv.createView(`/api/v1/lang/${app.lang}/user/${name}/favorite`, {});
        this.favoriteListView.removeCache();
        this.favoriteListView.fetch(res => {
            if (res.code === 200) {
                self.favoriteList = res.data || [];
                self.favoriteList.forEach((item) => {
                    self.favoriteObj[item.symbol] = item.favorite;
                });
            }
        });
    },
    isValidInput: function (value, precision) {
        if (precision != null && precision == 4) {
            if (! /^\d*(?:\.\d{0,4})?$/.test(value)) {
                return false;
            }
        }
        else {
            if (! /^\d*(?:\.\d{0,8})?$/.test(value)) {
                return false;
            }
        }
        return true;
    },
    getBalances: async function () {
        if (this.isSignedIn) {
            var self = this;
            var accountInfo = await tronWeb.trx.getAccount();
            self.eosBalance = accountInfo.balance / 1000000.0;

            if (!self.isTRC20(self.tokenId)) {
                var currentToken = accountInfo.asset.find(function (e) { return e.key == self.tokenId });
                if (currentToken) {
                    self.tokenBalance = currentToken.value;
                }
            }
            else {
                var contractAddress = self.getTRC20Address(self.tokenId);
                var contract = await tronWeb.contract().at(contractAddress);
                var balanceObj = await contract.balanceOf(app.account.name).call();
                self.tokenBalance = tronWeb.toSun(balanceObj.balance._hex) / 1000000000000.0;
            }
        }
    },
    checkPercentState() {
        if (this.buyPrecent) {
            //changed
            if (parseFloat(this.inputs.buyTotal) != parseFloat((this.buyPrecent * this.eosBalance).toFixed(app.precision.total))) {
                this.buyPrecent = 0;
            }
        }
        if (this.sellPrecent) {
            //changed
            if (parseFloat(this.inputs.sellTotal) != parseFloat((this.sellPrecent * this.tokenBalance).toFixed(app.precision.total))) {
                this.sellPrecent = 0;
            }
        }
    },
    handlePriceChange(type) {
        if (type === 'buy') {
            this.inputs.buyTotal = parseFloat(this.inputs.buyAmount * this.inputs.buyPrice).toFixed(app.precision.total)
        } else {
            this.inputs.sellTotal = parseFloat(this.inputs.sellAmount * this.inputs.sellPrice).toFixed(app.precision.total)
        }
        this.checkPercentState();
    },
    handleAmountChange(type) {
        if (type === 'buy') {
            this.inputs.buyTotal = parseFloat(this.inputs.buyAmount * this.inputs.buyPrice).toFixed(app.precision.total)
        } else {
            this.inputs.sellTotal = parseFloat(this.inputs.sellAmount * this.inputs.sellPrice).toFixed(app.precision.total)
        }
        this.checkPercentState();
    },
    handleTotalChange(type) {
        if (type === 'buy') {
            let isZero = (!this.inputs.buyPrice || parseFloat(this.inputs.buyPrice) == 0);
            this.inputs.buyAmount = isZero ? '0.0000' : parseFloat(this.inputs.buyTotal / this.inputs.buyPrice).toFixed(app.precision.amount);
        } else {
            let isZero = (!this.inputs.sellPrice || parseFloat(this.inputs.sellPrice) == 0);
            this.inputs.sellAmount = isZero ? '0.0000' : parseFloat(this.inputs.sellTotal / this.inputs.buyPrice).toFixed(app.precision.amount);
        }
        this.checkPercentState();
    },
    handleBlur(n, m = 8) {
        var currentVal = this.inputs[n];
        if (!currentVal) {
            this.inputs[n] = 0.0.toFixed(m);
        }
        else
            this.inputs[n] = parseFloat(currentVal).toFixed(m);
    },
    handlePrecentChange(n, x) {
        if (this.isSignedIn) {
            this[n] = x;
            if (n === 'buyPrecent') {
                let isZero = (!this.inputs.buyPrice || parseFloat(this.inputs.buyPrice) == 0);

                this.inputs.buyTotal = parseFloat(this.eosBalance * x).toFixed(app.precision.total);
                this.inputs.buyAmount = isZero ? '0.0000' : parseFloat(this.inputs.buyTotal / this.inputs.buyPrice).toFixed(app.precision.amount);
            } else {
                this.inputs.sellAmount = parseFloat(this.tokenBalance * x).toFixed(app.precision.amount);
                this.inputs.sellTotal = parseFloat(this.inputs.sellAmount * this.inputs.sellPrice).toFixed(app.precision.total);
            }
        }
    },
    pricePrecision(n) {
        return parseFloat(n).toFixed(app.precision.price);
    },
    amountPrecision(n) {
        return parseFloat(n).toFixed(app.precision.amount);
    },
    totalPrecision(n) {
        return parseFloat(n).toFixed(app.precision.total);
    },
    getOpenOrders() {
        var self = this;
        self.openOrdersView = qv.createView(`/api/v1/lang/${app.lang}/User/${app.account.name}/current-delegate`, {});
        self.openOrdersView.fetch(res => {
            if (res.code === 200) {
                self.openOrders = res.data || [];
            }
        })
    },
    getHistroyOrders(skip = 0) {
        let requestParams = {
            ...this.search,
            skip,
            take: this.pageSize
        }
        var self = this;
        self.histroyOrdersView = qv.createView(`/api/v1/lang/${app.lang}/User/${app.account ? app.account.name : null}/history-delegate`, requestParams);
        self.histroyOrdersView.fetch(res => {
            if (res.code === 200) {
                self.orderHistory = res.data.result || [];
                self.pageTotal = parseInt(res.data.total);
                self.pageCount = parseInt(res.data.count);
            }
        })
    },
    redirectToDetail(token) {
        app.redirect('/exchange/:id', '/exchange/' + token, { id: token }, {});

        this.initCandlestick(token);
    },
    toggleFav(token, i) {
        const isAdd = !this.favoriteListFilter[i].favorite;
        app.toggleFav(token, isAdd, () => {
            this.favoriteListFilter[i].favorite = isAdd;
        })
    },
    toggleFav(token) {
        const isAdd = !this.favoriteObj[token];
        app.toggleFav(token, isAdd, () => {
            this.favoriteObj[token] = isAdd;
        })
    },
    handlePageChange(i) {
        this.pageIndex = i;
        this.getHistroyOrders((i - 1) * this.pageSize);
    },
    next() {
        if (this.pageIndex < this.pageCount) {
            this.handlePageChange(this.pageIndex + 1);
        }
    },
    prev() {
        if (this.pageIndex > 1) {
            this.handlePageChange(this.pageIndex - 1);
        }
    },
    jump() {
        if (this.jumpPage < 1) { this.jumpPage = 1 }
        if (this.jumpPage > this.pageCount) { this.jumpPage = this.pageCount }
        this.handlePageChange(parseInt(this.jumpPage));
    }
}
component.computed = {
    isSignedIn: function () {
        return !(app.account == null || app.account.name == null);
    },
    favoriteListFilter() {
        if (this.control.markets === 'favorite') {
            return this.favoriteList.filter(x => x.symbol.includes(this.inputs.tokenSearchInput.toUpperCase()) && x.favorite)
        } else {
            return this.favoriteList.filter(x => x.symbol.includes(this.inputs.tokenSearchInput.toUpperCase()))
        }
    }
};
component.watch = {
    'chart.interval': function (v) {
        //this.chartWidget.chart().setResolution(v);
        this.initCandlestick();
    },
    '$root.isSignedIn': function (val) {
        if (val === true) {
            this.initUserViews();
            this.getFavoriteList();
        }
        //logout
        else {
            //comments: stop qv job or use signalR
        }
    },
    //reload multi language ajax method
    '$root.lang': function () {
        this.getTokenInfo();
        //this.initCandlestick();
    },
    deep: true
}