var vumigo = require('vumigo_v02');
var fixtures = require('./fixtures');
var assert = require('assert');
var AppTester = vumigo.AppTester;


describe("Shared Utils", function() {
    describe("go.utils.return_true", function() {
        it("should return true", function(done) {
            assert.equal(go.utils.return_true(), true);
            done();
        });
    });
    describe("go.utils.return_false", function() {
        it("should return false", function(done) {
            assert.equal(go.utils.return_false(), false);
            done();
        });
    });
});


describe("Mama Nigeria App", function() {
    describe("Voice Registration", function() {
        var app;
        var tester;

        beforeEach(function() {
            app = new go.app.GoApp();
            tester = new AppTester(app);

            tester
                .setup.config.app({
                    name: 'voice_registration',
                    control: {
                        url: "http://localhost:8000/api/v1/",
                        api_key: "test_key"
                    }
                })
                .setup(function(api) {
                    fixtures().forEach(api.http.fixtures.add);
                })
                ;
        });


        // TEST ANSWER RESET

        describe("When you go back to the main menu", function() {
            it("should reset the user answers", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002',
                        '*'
                    )
                    .check.interaction({
                        state: 'state_r01_number',
                        reply: 'Welcome, Number'
                    })
                    .check.user.properties({
                        answers: {}
                    })
                    .run();
            });
        });

        // TEST REGISTRATION FLOW

        describe("When you start the app", function() {
            it("should navigate to state r01_number", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'}
                    )
                    .check.interaction({
                        state: 'state_r01_number',
                        reply: 'Welcome, Number'
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8000/api/v1/en/state_r01_number_1.mp3'
                            }
                        }
                    })
                    .run();
            });
        });

        describe("When you enter a phone number r01_number", function() {
            describe("if the number validates", function() {
                it("should navigate to state r03_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                        )
                        .check.interaction({
                            state: 'state_r03_receiver',
                            reply: [
                                'Choose receiver',
                                '1. Mother',
                                '2. Other'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r03_receiver_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the number does not validate", function() {
                it("should navigate to state r02_retry_number", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002'
                        )
                        .check.interaction({
                            state: 'state_r02_retry_number',
                            reply: 'Retry number'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r02_retry_number_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the retried number does not validate", function() {
                it("should navigate to state r02_retry_number again", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002',
                            '+08080020002'
                        )
                        .check.interaction({
                            state: 'state_r02_retry_number',
                            reply: 'Retry number'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r02_retry_number_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the user tries to restart with *", function() {
                it("should not restart", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002',
                            '*'
                        )
                        .check.interaction({
                            state: 'state_r02_retry_number',
                            reply: 'Retry number'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r02_retry_number_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the retried number validates", function() {
                it("should navigate to state r03_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '+08080020002',
                            '08080020002'
                        )
                        .check.interaction({
                            state: 'state_r03_receiver',
                            reply: [
                                'Choose receiver',
                                '1. Mother',
                                '2. Other'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r03_receiver_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice r03_receiver", function() {
            describe("if it is a valid choice", function() {
                it("should navigate to state r04_mom_state", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                        )
                        .check.interaction({
                            state: 'state_r04_mom_state',
                            reply: [
                                'Pregnant or baby',
                                '1. Pregnant',
                                '2. Baby'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r04_mom_state_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if it is *", function() {
                it("should restart", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '*'  // r03_receiver - restart
                        )
                        .check.interaction({
                            state: 'state_r01_number',
                            reply: 'Welcome, Number'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r01_number_1.mp3'
                                }
                            }
                    })
                        .run();
                });
            });

            describe("if it is an invalid choice", function() {
                it("should replay r03_receiver", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '7'  // r03_receiver - invalid choice
                        )
                        .check.interaction({
                            state: 'state_r03_receiver',
                            reply: [
                                'Choose receiver',
                                '1. Mother',
                                '2. Other'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r03_receiver_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice r04_mom_state", function() {
            describe("if you choose pregnant", function() {
                it("should navigate to state r05_birth_year", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '1'  // r04_mom_state - pregnant
                        )
                        .check.interaction({
                            state: 'state_r05_birth_year',
                            reply: [
                                'Birth year?',
                                '1. this_year',
                                '2. next_year'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r05_birth_year_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if you choose baby", function() {
                it("should navigate to state r05_birth_year", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                        )
                        .check.interaction({
                            state: 'state_r05_birth_year',
                            reply: [
                                'Birth year?',
                                '1. last_year',
                                '2. this_year'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r05_birth_year_2.mp3'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice r05_birth_year", function() {
            describe("if the mother is pregnant", function() {
                it("should navigate to state r06_birth_month", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '1'  // r04_mom_state - pregnant
                            , '1'  // r05_birth_year - this year
                        )
                        .check.interaction({
                            state: 'state_r06_birth_month',
                            reply: [
                                'Birth month? 1-12',
                                '1. 1', '2. 2', '3. 3', '4. 4', '5. 5', '6. 6',
                                '7. 7', '8. 8', '9. 9', '10. 10', '11. 11',
                                '12. 12'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r06_birth_month_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if the mother has had her baby", function() {
                it("should navigate to state r06_birth_month", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                            , '1'  // r05_birth_year - last year
                        )
                        .check.interaction({
                            state: 'state_r06_birth_month',
                            reply: [
                                'Birth month? 1-12',
                                '1. 1', '2. 2', '3. 3', '4. 4', '5. 5', '6. 6',
                                '7. 7', '8. 8', '9. 9', '10. 10', '11. 11',
                                '12. 12'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r06_birth_month_2.mp3'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you enter a choice r06_birth_month", function() {
            it("should ask for month confirmation r07_confirm_month", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '1'  // r04_mom_state - pregnant
                        , '1'  // r05_birth_year - this year
                        , '6'  // r06_birth_month - june
                    )
                    .check.interaction({
                        state: 'state_r07_confirm_month',
                        reply: [
                            'You entered x for Month. Correct?',
                            '1. confirm',
                            '2. retry'
                        ].join('\n')
                    })
                    .check.reply.properties({
                        helper_metadata: {
                            voice: {
                                speech_url: 'http://localhost:8000/api/v1/en/state_r07_confirm_month_6.mp3'
                            }
                        }
                    })
                    .run();
            });
        });

        describe("When you enter a choice r07_confirm_month", function() {
            describe("if the mother is pregnant", function() {
                describe("if you select retry", function() {
                    it("should navigate to state r06_birth_month again", function() {
                        return tester
                            .setup.user.addr('+07030010001')
                            .inputs(
                                {session_event: 'new'},
                                '08080020002'
                                , '1'  // r03_receiver - mother
                                , '1'  // r04_mom_state - pregnant
                                , '1'  // r05_birth_year - this year
                                , '6'  // r06_birth_month - june
                                , '2'  // r07_confirm_month - retry
                            )
                            .check.interaction({
                                state: 'state_r06_birth_month',
                                reply: [
                                    'Birth month? 1-12',
                                    '1. 1', '2. 2', '3. 3', '4. 4', '5. 5', '6. 6',
                                    '7. 7', '8. 8', '9. 9', '10. 10', '11. 11',
                                    '12. 12'
                                ].join('\n')
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: 'http://localhost:8000/api/v1/en/state_r06_birth_month_1.mp3'
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if you select confirm", function() {
                    it("should navigate to state r08_birth_day", function() {
                        return tester
                            .setup.user.addr('+07030010001')
                            .inputs(
                                {session_event: 'new'},
                                '08080020002'
                                , '1'  // r03_receiver - mother
                                , '1'  // r04_mom_state - pregnant
                                , '1'  // r05_birth_year - this year
                                , '6'  // r06_birth_month - june
                                , '1'  // r07_confirm_month - confirm
                            )
                            .check.interaction({
                                state: 'state_r08_birth_day',
                                reply: 'Birth day in 6?'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: 'http://localhost:8000/api/v1/en/state_r08_birth_day_6.mp3'
                                    }
                                }
                            })
                            .run();
                    });
                });
            });

            describe("if the mother has had her baby", function() {
                describe("if you select retry", function() {
                    it("should navigate to state r06_birth_month again", function() {
                        return tester
                            .setup.user.addr('+07030010001')
                            .inputs(
                                {session_event: 'new'},
                                '08080020002'
                                , '1'  // r03_receiver - mother
                                , '2'  // r04_mom_state - baby
                                , '1'  // r05_birth_year - last year
                                , '11'  // r06_birth_month - november
                                , '2'  // r07_confirm_month - retry
                            )
                            .check.interaction({
                                state: 'state_r06_birth_month',
                                reply: [
                                    'Birth month? 1-12',
                                    '1. 1', '2. 2', '3. 3', '4. 4', '5. 5', '6. 6',
                                    '7. 7', '8. 8', '9. 9', '10. 10', '11. 11',
                                    '12. 12'
                                ].join('\n')
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: 'http://localhost:8000/api/v1/en/state_r06_birth_month_2.mp3'
                                    }
                                }
                            })
                            .run();
                    });
                });

                describe("if you select confirm", function() {
                    it("should navigate to state r08_birth_day", function() {
                        return tester
                            .setup.user.addr('+07030010001')
                            .inputs(
                                {session_event: 'new'},
                                '08080020002'
                                , '1'  // r03_receiver - mother
                                , '2'  // r04_mom_state - baby
                                , '1'  // r05_birth_year - last year
                                , '11'  // r06_birth_month - november
                                , '1'  // r07_confirm_month - confirm
                            )
                            .check.interaction({
                                state: 'state_r08_birth_day',
                                reply: 'Birth day in 11?'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: 'http://localhost:8000/api/v1/en/state_r08_birth_day_23.mp3'
                                    }
                                }
                            })
                            .run();
                    });

                    it("should navigate to state r08_birth_day", function() {
                        return tester
                            .setup.user.addr('+07030010001')
                            .inputs(
                                {session_event: 'new'},
                                '08080020002'
                                , '1'  // r03_receiver - mother
                                , '2'  // r04_mom_state - baby
                                , '2'  // r05_birth_year - this year
                                , '12'  // r06_birth_month - december
                                , '1'  // r07_confirm_month - confirm
                            )
                            .check.interaction({
                                state: 'state_r08_birth_day',
                                reply: 'Birth day in 12?'
                            })
                            .check.reply.properties({
                                helper_metadata: {
                                    voice: {
                                        speech_url: 'http://localhost:8000/api/v1/en/state_r08_birth_day_36.mp3'
                                    }
                                }
                            })
                            .run();
                    });
                });
            });
        });


        describe("when you enter a birth day r08_birth_day", function() {
            describe("if it is a valid day", function() {
                it("should navigate to state r09_language", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                            , '2'  // r05_birth_year - this year
                            , '12'  // r06_birth_month - december
                            , '1'  // r07_confirm_month - confirm
                            , '21'  // r08_birth_day - 21st
                        )
                        .check.interaction({
                            state: 'state_r09_language',
                            reply: [
                                'Language?',
                                '1. english',
                                '2. hausa',
                                '3. igbo'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r09_language_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });

            describe("if it is *", function() {
                it("should restart", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                            , '2'  // r05_birth_year - this year
                            , '12'  // r06_birth_month - december
                            , '1'  // r07_confirm_month - confirm
                            , '*'  // r08_birth_day - restart
                        )
                        .check.interaction({
                            state: 'state_r01_number'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r01_number_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you choose a language r09_language", function() {
            it("should navigate to state r10_message_type", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '2'  // r04_mom_state - baby
                        , '2'  // r05_birth_year - this year
                        , '12'  // r06_birth_month - december
                        , '1'  // r07_confirm_month - confirm
                        , '21'  // r08_birth_day - 21st
                        , '1'  // r09_language - english
                    )
                    .check.interaction({
                        state: 'state_r10_message_type',
                        reply: [
                            'Channel?',
                            '1. sms',
                            '2. voice'
                        ].join('\n')
                    })
                    .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r10_message_type_1.mp3'
                                }
                            }
                        })
                    .run();
            });
        });

        describe("When you choose a channel r10_message_type", function() {
            describe("if you choose sms", function() {
                it("should navigate to state r13_end", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                            , '2'  // r05_birth_year - this year
                            , '12'  // r06_birth_month - december
                            , '1'  // r07_confirm_month - confirm
                            , '21'  // r08_birth_day - 21st
                            , '1'  // r09_language - english
                            , '1'  // r10_message_type - sms
                        )
                        .check.interaction({
                            state: 'state_r13_end',
                            reply: 'Thank you!'
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r13_end_1.mp3'
                                }
                            }
                        })
                        .check.reply.ends_session()
                        .run();
                });
            });

            describe("if you choose voice", function() {
                it("should navigate to state r11_voice_days", function() {
                    return tester
                        .setup.user.addr('+07030010001')
                        .inputs(
                            {session_event: 'new'},
                            '08080020002'
                            , '1'  // r03_receiver - mother
                            , '2'  // r04_mom_state - baby
                            , '2'  // r05_birth_year - this year
                            , '12'  // r06_birth_month - december
                            , '1'  // r07_confirm_month - confirm
                            , '21'  // r08_birth_day - 21st
                            , '1'  // r09_language - english
                            , '2'  // r10_message_type - voice
                        )
                        .check.interaction({
                            state: 'state_r11_voice_days',
                            reply: [
                                'Message days?',
                                '1. mon_wed',
                                '2. tue_thu'
                            ].join('\n')
                        })
                        .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r11_voice_days_1.mp3'
                                }
                            }
                        })
                        .run();
                });
            });
        });

        describe("When you choose a day r11_voice_days", function() {
            it("should navigate to state r12_voice_times", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '2'  // r04_mom_state - baby
                        , '2'  // r05_birth_year - this year
                        , '12'  // r06_birth_month - december
                        , '1'  // r07_confirm_month - confirm
                        , '21'  // r08_birth_day - 21st
                        , '1'  // r09_language - english
                        , '2'  // r10_message_type - voice
                        , '1'  // r11_voice_days - mon_wed
                    )
                    .check.interaction({
                        state: 'state_r12_voice_times',
                        reply: [
                            'Message time?',
                            '1. 9_11',
                            '2. 2_5'
                        ].join('\n')
                    })
                    .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r12_voice_times_1.mp3'
                                }
                            }
                        })
                    .run();
            });
        });

        describe("When you choose a time r12_voice_times", function() {
            it("should navigate to state r13_end", function() {
                return tester
                    .setup.user.addr('+07030010001')
                    .inputs(
                        {session_event: 'new'},
                        '08080020002'
                        , '1'  // r03_receiver - mother
                        , '2'  // r04_mom_state - baby
                        , '2'  // r05_birth_year - this year
                        , '12'  // r06_birth_month - december
                        , '1'  // r07_confirm_month - confirm
                        , '21'  // r08_birth_day - 21st
                        , '1'  // r09_language - english
                        , '2'  // r10_message_type - voice
                        , '1'  // r11_voice_days - mon_wed
                        , '2'  // r12_voice_times - 2_5
                    )
                    .check.interaction({
                        state: 'state_r13_end',
                        reply: 'Thank you! Time: 2_5. Days: mon_wed.'
                    })
                    .check.reply.properties({
                            helper_metadata: {
                                voice: {
                                    speech_url: 'http://localhost:8000/api/v1/en/state_r13_end_4.mp3'
                                }
                            }
                        })
                    .check.reply.ends_session()
                    .run();
            });
        });

    });
});
