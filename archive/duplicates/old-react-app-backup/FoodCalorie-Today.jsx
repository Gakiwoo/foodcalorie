import React from 'react';

export default function FoodCalorieToday() {
  return (
    <div
      data-node-id="5:027553"
      data-name="FoodCalorie-Today"
      style={{
        width: '375px',
        height: '812px',
        minHeight: '812px',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column',
        background: '#F7F8FA',
        overflow: 'hidden'
      }}>
      <div
        data-node-id="5:027559"
        data-name="status-bar"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '12px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <span
          data-node-id="5:027561"
          data-name="status-time"
          style={{
            color: '#1A1A1A',
            fontSize: '15px',
            fontFamily: 'Inter',
            fontWeight: '600',
            lineHeight: '20px'
          }}>
          9:41
        </span>
        <div
          data-node-id="5:027593"
          data-name="status-icons"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '6px'
          }}>
          <img
            src="./asset/icons/svg_dafe2afa.svg"
            data-node-id="5:026759"
            data-name="icon-signal"
            style={{ width: '14px', height: '14px' }}
          />
          <img
            src="./asset/icons/svg_7d24f493.svg"
            data-node-id="5:026763"
            data-name="icon-wifi"
            style={{ width: '14px', height: '14px' }}
          />
          <img
            src="./asset/icons/svg_c23974ea.svg"
            data-node-id="5:026767"
            data-name="icon-battery"
            style={{ width: '14px', height: '14px' }}
          />
        </div>
      </div>
      <div
        data-node-id="5:027608"
        data-name="top-nav"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'center',
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <img
          src="./asset/icons/svg_e5121903.svg"
          data-node-id="5:026771"
          data-name="nav-back"
          style={{ width: '22px', height: '22px' }}
        />
        <p
          data-node-id="5:027614"
          data-name="nav-title"
          style={{
            flex: '1',
            color: '#1A1A1A',
            fontSize: '18px',
            fontFamily: 'Inter',
            textAlign: 'center',
            fontWeight: '700',
            lineHeight: '24px'
          }}>
          今日记录
        </p>
        <span
          data-node-id="5:027657"
          data-name="nav-date"
          style={{
            color: '#9CA3AF',
            fontSize: '14px',
            fontFamily: 'Inter',
            fontWeight: '500',
            lineHeight: '18px'
          }}>
          8月5日
        </span>
      </div>
      <div
        data-node-id="5:027705"
        data-name="hero-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          paddingTop: '8px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="5:027709"
          data-name="hero-card"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '20px',
            padding: '24px',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="5:027715"
            data-name="ring"
            style={{
              width: '112px',
              height: '112px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '112px'
            }}>
            <div
              data-node-id="5:027717"
              data-name="ring-inner"
              style={{
                width: '86px',
                height: '86px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '2px',
                background: '#FFFFFF',
                borderRadius: '86px'
              }}>
              <span
                data-node-id="5:027721"
                data-name="ring-value"
                style={{
                  color: '#1A1A1A',
                  fontSize: '22px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '700',
                  lineHeight: '26px'
                }}>
                1080
              </span>
              <span
                data-node-id="5:027755"
                data-name="ring-label"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  lineHeight: '14px'
                }}>
                已摄入 kcal
              </span>
            </div>
          </div>
          <div
            data-node-id="5:027786"
            data-name="hero-stats"
            style={{
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '10px'
            }}>
            <span
              data-node-id="5:027790"
              data-name="hero-goal"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '14px',
                fontFamily: 'Inter',
                fontWeight: '600',
                lineHeight: '18px'
              }}>
              目标 1400 kcal
            </span>
            <span
              data-node-id="5:027829"
              data-name="hero-remain"
              style={{
                flexShrink: '0',
                color: '#34C759',
                fontSize: '13px',
                fontFamily: 'Inter',
                lineHeight: '18px'
              }}>
              还可摄入 320 kcal
            </span>
            <div
              data-node-id="5:027867"
              data-name="hero-bar"
              style={{
                width: '140px',
                height: '8px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'flex-start',
                alignItems: 'center',
                background: '#E8F5EC',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
              <div
                data-node-id="5:027871"
                data-name="hero-bar-fill"
                style={{
                  width: '107.8px',
                  height: '8px',
                  display: 'flex',
                  flex: 'none',
                  justifyContent: 'flex-start',
                  alignItems: 'center',
                  background: '#34C759',
                  borderRadius: '8px'
                }}></div>
            </div>
          </div>
        </div>
      </div>
      <div
        data-node-id="5:027875"
        data-name="macro-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          paddingTop: '8px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="5:027877"
          data-name="macro-card"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="5:027883"
            data-name="macro-col-1"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="5:027885"
              data-name="macro-1-val"
              style={{
                color: '#1A1A1A',
                fontSize: '18px',
                fontFamily: 'Inter',
                textAlign: 'center',
                fontWeight: '700',
                lineHeight: '22px'
              }}>
              155g
            </span>
            <span
              data-node-id="5:027917"
              data-name="macro-1-label"
              style={{
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                textAlign: 'center',
                lineHeight: '16px'
              }}>
              碳水
            </span>
          </div>
          <div
            data-node-id="5:027953"
            data-name="macro-divider-1"
            style={{
              width: '1px',
              height: '28px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              flexDirection: 'column',
              background: '#EEF0F2'
            }}></div>
          <div
            data-node-id="5:027957"
            data-name="macro-col-2"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="5:027960"
              data-name="macro-2-val"
              style={{
                color: '#1A1A1A',
                fontSize: '18px',
                fontFamily: 'Inter',
                textAlign: 'center',
                fontWeight: '700',
                lineHeight: '22px'
              }}>
              75g
            </span>
            <span
              data-node-id="5:027991"
              data-name="macro-2-label"
              style={{
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                textAlign: 'center',
                lineHeight: '16px'
              }}>
              蛋白质
            </span>
          </div>
          <div
            data-node-id="5:028026"
            data-name="macro-divider-2"
            style={{
              width: '1px',
              height: '28px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              flexDirection: 'column',
              background: '#EEF0F2'
            }}></div>
          <div
            data-node-id="5:028032"
            data-name="macro-col-3"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="5:028034"
              data-name="macro-3-val"
              style={{
                color: '#1A1A1A',
                fontSize: '18px',
                fontFamily: 'Inter',
                textAlign: 'center',
                fontWeight: '700',
                lineHeight: '22px'
              }}>
              40g
            </span>
            <span
              data-node-id="5:028066"
              data-name="macro-3-label"
              style={{
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                textAlign: 'center',
                lineHeight: '16px'
              }}>
              脂肪
            </span>
          </div>
        </div>
      </div>
      <div
        data-node-id="5:028101"
        data-name="meals-list"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          gap: '16px',
          paddingTop: '8px',
          paddingBottom: '16px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="5:028104"
          data-name="meal-breakfast"
          style={{
            display: 'flex',
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column',
            gap: '10px'
          }}>
          <div
            data-node-id="5:028106"
            data-name="meal-header-1"
            style={{
              display: 'flex',
              alignSelf: 'stretch',
              flexShrink: '0',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <span
              data-node-id="5:028108"
              data-name="meal-title-1"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '20px'
              }}>
              早餐
            </span>
            <span
              data-node-id="5:028147"
              data-name="meal-cal-1"
              style={{
                flexShrink: '0',
                color: '#34C759',
                fontSize: '13px',
                fontFamily: 'Inter',
                textAlign: 'right',
                fontWeight: '600',
                lineHeight: '18px'
              }}>
              210 kcal
            </span>
          </div>
          <div
            data-node-id="5:028179"
            data-name="food-card-b"
            style={{
              width: '335px',
              display: 'flex',
              flex: 'none',
              flexShrink: '0',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
            }}>
            <div
              data-node-id="5:028187"
              data-name="food-thumb-b"
              style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #D1C4E9 0%, #B39DDB 100%)',
                borderRadius: '12px'
              }}>
              <img
                src="./asset/icons/svg_cd943b45.svg"
                data-node-id="5:026775"
                data-name="food-icon-b"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            <div
              data-node-id="5:028195"
              data-name="food-info-b"
              style={{
                display: 'flex',
                flex: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="5:028197"
                data-name="food-name-b"
                style={{
                  flexShrink: '0',
                  color: '#1A1A1A',
                  fontSize: '15px',
                  fontFamily: 'Inter',
                  fontWeight: '600',
                  lineHeight: '20px'
                }}>
                蓝莓酸奶杯
              </span>
              <span
                data-node-id="5:028235"
                data-name="food-time-b"
                style={{
                  flexShrink: '0',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  lineHeight: '16px'
                }}>
                09:15
              </span>
            </div>
            <div
              data-node-id="5:028267"
              data-name="food-cal-b"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
                gap: '2px'
              }}>
              <span
                data-node-id="5:028269"
                data-name="food-cal-value-b"
                style={{
                  color: '#34C759',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  fontWeight: '700',
                  lineHeight: '22px'
                }}>
                210 kcal
              </span>
              <span
                data-node-id="5:028302"
                data-name="food-cal-proto-b"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  lineHeight: '15px'
                }}>
                蛋白 12g
              </span>
            </div>
          </div>
        </div>
        <div
          data-node-id="5:028336"
          data-name="meal-lunch"
          style={{
            display: 'flex',
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column',
            gap: '10px'
          }}>
          <div
            data-node-id="5:028338"
            data-name="meal-header-2"
            style={{
              display: 'flex',
              alignSelf: 'stretch',
              flexShrink: '0',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <span
              data-node-id="5:028341"
              data-name="meal-title-2"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '20px'
              }}>
              午餐
            </span>
            <span
              data-node-id="5:028379"
              data-name="meal-cal-2"
              style={{
                flexShrink: '0',
                color: '#34C759',
                fontSize: '13px',
                fontFamily: 'Inter',
                textAlign: 'right',
                fontWeight: '600',
                lineHeight: '18px'
              }}>
              520 kcal
            </span>
          </div>
          <div
            data-node-id="5:028410"
            data-name="food-card-l"
            style={{
              width: '335px',
              display: 'flex',
              flex: 'none',
              flexShrink: '0',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
            }}>
            <div
              data-node-id="5:028418"
              data-name="food-thumb-l"
              style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)',
                borderRadius: '12px'
              }}>
              <img
                src="./asset/icons/svg_1b69e699.svg"
                data-node-id="5:026779"
                data-name="food-icon-l"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            <div
              data-node-id="5:028426"
              data-name="food-info-l"
              style={{
                display: 'flex',
                flex: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="5:028428"
                data-name="food-name-l"
                style={{
                  flexShrink: '0',
                  color: '#1A1A1A',
                  fontSize: '15px',
                  fontFamily: 'Inter',
                  fontWeight: '600',
                  lineHeight: '20px'
                }}>
                红烧牛肉面
              </span>
              <span
                data-node-id="5:028466"
                data-name="food-time-l"
                style={{
                  flexShrink: '0',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  lineHeight: '16px'
                }}>
                12:30
              </span>
            </div>
            <div
              data-node-id="5:028498"
              data-name="food-cal-l"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
                gap: '2px'
              }}>
              <span
                data-node-id="5:028500"
                data-name="food-cal-value-l"
                style={{
                  color: '#34C759',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  fontWeight: '700',
                  lineHeight: '22px'
                }}>
                520 kcal
              </span>
              <span
                data-node-id="5:028531"
                data-name="food-cal-proto-l"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  lineHeight: '15px'
                }}>
                蛋白 28g
              </span>
            </div>
          </div>
        </div>
        <div
          data-node-id="5:028567"
          data-name="meal-dinner"
          style={{
            display: 'flex',
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column',
            gap: '10px'
          }}>
          <div
            data-node-id="5:028569"
            data-name="meal-header-3"
            style={{
              display: 'flex',
              alignSelf: 'stretch',
              flexShrink: '0',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <span
              data-node-id="5:028571"
              data-name="meal-title-3"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '20px'
              }}>
              晚餐
            </span>
            <span
              data-node-id="5:028609"
              data-name="meal-cal-3"
              style={{
                flexShrink: '0',
                color: '#34C759',
                fontSize: '13px',
                fontFamily: 'Inter',
                textAlign: 'right',
                fontWeight: '600',
                lineHeight: '18px'
              }}>
              350 kcal
            </span>
          </div>
          <div
            data-node-id="5:028642"
            data-name="food-card-d"
            style={{
              width: '335px',
              display: 'flex',
              flex: 'none',
              flexShrink: '0',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#FFFFFF',
              borderRadius: '16px',
              boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
            }}>
            <div
              data-node-id="5:028648"
              data-name="food-thumb-d"
              style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #C8E6C9 0%, #A5D6A7 100%)',
                borderRadius: '12px'
              }}>
              <img
                src="./asset/icons/svg_94c4a429.svg"
                data-node-id="5:026783"
                data-name="food-icon-d"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            <div
              data-node-id="5:028656"
              data-name="food-info-d"
              style={{
                display: 'flex',
                flex: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="5:028658"
                data-name="food-name-d"
                style={{
                  flexShrink: '0',
                  color: '#1A1A1A',
                  fontSize: '15px',
                  fontFamily: 'Inter',
                  fontWeight: '600',
                  lineHeight: '20px'
                }}>
                鸡胸沙拉
              </span>
              <span
                data-node-id="5:028696"
                data-name="food-time-d"
                style={{
                  flexShrink: '0',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  lineHeight: '16px'
                }}>
                18:40
              </span>
            </div>
            <div
              data-node-id="5:028726"
              data-name="food-cal-d"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
                gap: '2px'
              }}>
              <span
                data-node-id="5:028730"
                data-name="food-cal-value-d"
                style={{
                  color: '#34C759',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  fontWeight: '700',
                  lineHeight: '22px'
                }}>
                350 kcal
              </span>
              <span
                data-node-id="5:028761"
                data-name="food-cal-proto-d"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  lineHeight: '15px'
                }}>
                蛋白 35g
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        data-node-id="5:028795"
        data-name="bottom-nav"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '8px',
          paddingTop: '10px',
          paddingBottom: '10px',
          paddingRight: '20px',
          paddingLeft: '20px',
          background: '#FFFFFF'
        }}>
        <div
          data-node-id="5:028801"
          data-name="nav-home"
          style={{
            display: 'flex',
            flex: '1',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '4px'
          }}>
          <img
            src="./asset/icons/svg_e5f7842f.svg"
            data-node-id="5:026787"
            data-name="nav-home-icon"
            style={{ width: '22px', height: '22px' }}
          />
          <span
            data-node-id="5:028807"
            data-name="nav-home-label"
            style={{
              flexShrink: '0',
              color: '#9CA3AF',
              fontSize: '11px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: '14px'
            }}>
            首页
          </span>
        </div>
        <div
          data-node-id="5:028840"
          data-name="nav-record"
          style={{
            display: 'flex',
            flex: '1',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '4px'
          }}>
          <img
            src="./asset/icons/svg_149a07d6.svg"
            data-node-id="5:026791"
            data-name="nav-record-icon"
            style={{ width: '22px', height: '22px' }}
          />
          <span
            data-node-id="5:028847"
            data-name="nav-record-label"
            style={{
              flexShrink: '0',
              color: '#34C759',
              fontSize: '11px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '600',
              lineHeight: '14px'
            }}>
            记录
          </span>
        </div>
        <div
          data-node-id="5:028881"
          data-name="nav-discover"
          style={{
            display: 'flex',
            flex: '1',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '4px'
          }}>
          <img
            src="./asset/icons/svg_d909fe4e.svg"
            data-node-id="5:026795"
            data-name="nav-discover-icon"
            style={{ width: '22px', height: '22px' }}
          />
          <span
            data-node-id="5:028889"
            data-name="nav-discover-label"
            style={{
              flexShrink: '0',
              color: '#9CA3AF',
              fontSize: '11px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: '14px'
            }}>
            发现
          </span>
        </div>
        <div
          data-node-id="5:028922"
          data-name="nav-me"
          style={{
            display: 'flex',
            flex: '1',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: '4px'
          }}>
          <img
            src="./asset/icons/svg_c8119b32.svg"
            data-node-id="5:026799"
            data-name="nav-me-icon"
            style={{ width: '22px', height: '22px' }}
          />
          <span
            data-node-id="5:028931"
            data-name="nav-me-label"
            style={{
              flexShrink: '0',
              color: '#9CA3AF',
              fontSize: '11px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '500',
              lineHeight: '14px'
            }}>
            我的
          </span>
        </div>
      </div>
    </div>
  );
}
