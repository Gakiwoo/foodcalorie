import React from 'react';

export default function FoodCalorieRecords() {
  return (
    <div
      data-node-id="5:025802"
      data-name="FoodCalorie-Records"
      style={{
        width: '375px',
        height: '904px',
        minHeight: '812px',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        flexDirection: 'column',
        background: '#F7F8FA',
        overflow: 'hidden'
      }}>
      <div
        data-node-id="5:025808"
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
          data-node-id="5:025810"
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
          data-node-id="5:025842"
          data-name="status-icons"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '6px'
          }}>
          <img
            src="./asset/icons/svg_dafe2afa.svg"
            data-node-id="5:024993"
            data-name="icon-signal"
            style={{ width: '14px', height: '14px' }}
          />
          <img
            src="./asset/icons/svg_7d24f493.svg"
            data-node-id="5:024997"
            data-name="icon-wifi"
            style={{ width: '14px', height: '14px' }}
          />
          <img
            src="./asset/icons/svg_c23974ea.svg"
            data-node-id="5:025001"
            data-name="icon-battery"
            style={{ width: '14px', height: '14px' }}
          />
        </div>
      </div>
      <div
        data-node-id="5:025858"
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
        <div
          data-node-id="5:025860"
          data-name="nav-spacer"
          style={{
            width: '20px',
            height: '20px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column'
          }}></div>
        <p
          data-node-id="5:025862"
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
          记录
        </p>
        <img
          src="./asset/icons/svg_5c9518fc.svg"
          data-node-id="5:025005"
          data-name="nav-filter"
          style={{ width: '20px', height: '20px' }}
        />
      </div>
      <div
        data-node-id="5:025911"
        data-name="summary-section"
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
          data-node-id="5:025913"
          data-name="summary-card"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '16px',
            padding: '20px',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="5:025919"
            data-name="donut"
            style={{
              width: '96px',
              height: '96px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '96px'
            }}>
            <div
              data-node-id="5:025921"
              data-name="donut-inner"
              style={{
                width: '72px',
                height: '72px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '2px',
                background: '#FFFFFF',
                borderRadius: '72px'
              }}>
              <span
                data-node-id="5:025925"
                data-name="donut-value"
                style={{
                  color: '#1A1A1A',
                  fontSize: '18px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '700',
                  lineHeight: '22px'
                }}>
                61%
              </span>
              <span
                data-node-id="5:025956"
                data-name="donut-label"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  lineHeight: '14px'
                }}>
                已摄入
              </span>
            </div>
          </div>
          <div
            data-node-id="5:025990"
            data-name="summary-stats"
            style={{
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '8px'
            }}>
            <span
              data-node-id="5:025992"
              data-name="stat-week"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '20px'
              }}>
              本周摄入 8650 kcal
            </span>
            <span
              data-node-id="5:026033"
              data-name="stat-avg"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '13px',
                fontFamily: 'Inter',
                lineHeight: '18px'
              }}>
              日均 1236 kcal
            </span>
            <div
              data-node-id="5:026154"
              data-name="macro-3"
              style={{
                height: '26px',
                display: 'flex',
                flexShrink: '0',
                justifyContent: 'center',
                alignItems: 'center',
                paddingRight: '10px',
                paddingLeft: '10px',
                background: '#E8F5EC',
                borderRadius: '13px'
              }}>
              <span
                data-node-id="5:026158"
                data-name="脂肪 25%"
                style={{
                  color: '#22A85A',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  fontWeight: '600',
                  lineHeight: '15px'
                }}>
                脂肪 25%
              </span>
            </div>
            <div
              data-node-id="5:026063"
              data-name="macro-row"
              style={{
                display: 'flex',
                flexShrink: '0',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '8px',
                paddingTop: '4px'
              }}>
              <div
                data-node-id="5:026065"
                data-name="macro-1"
                style={{
                  height: '26px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingRight: '10px',
                  paddingLeft: '10px',
                  background: '#E8F5EC',
                  borderRadius: '13px'
                }}>
                <span
                  data-node-id="5:026072"
                  data-name="碳水 45%"
                  style={{
                    color: '#22A85A',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    lineHeight: '15px'
                  }}>
                  碳水 45%
                </span>
              </div>
              <div
                data-node-id="5:026112"
                data-name="macro-2"
                style={{
                  height: '26px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  paddingRight: '10px',
                  paddingLeft: '10px',
                  background: '#E8F5EC',
                  borderRadius: '13px'
                }}>
                <span
                  data-node-id="5:026116"
                  data-name="蛋白 30%"
                  style={{
                    color: '#22A85A',
                    fontSize: '12px',
                    fontFamily: 'Inter',
                    fontWeight: '600',
                    lineHeight: '15px'
                  }}>
                  蛋白 30%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        data-node-id="5:026194"
        data-name="segment-section"
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
          data-node-id="5:026197"
          data-name="segment"
          style={{
            width: '335px',
            height: '40px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'center',
            gap: '4px',
            padding: '4px',
            background: '#FFFFFF',
            borderRadius: '20px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="5:026203"
            data-name="seg-day"
            style={{
              height: '32px',
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'center',
              background: '#34C759',
              borderRadius: '16px'
            }}>
            <span
              data-node-id="5:026207"
              data-name="seg-day-label"
              style={{
                flexShrink: '0',
                color: '#FFFFFF',
                fontSize: '14px',
                fontFamily: 'Inter',
                textAlign: 'center',
                fontWeight: '600',
                lineHeight: '18px'
              }}>
              日
            </span>
          </div>
          <div
            data-node-id="5:026241"
            data-name="seg-week"
            style={{
              height: '32px',
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '16px'
            }}>
            <span
              data-node-id="5:026243"
              data-name="seg-week-label"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '14px',
                fontFamily: 'Inter',
                textAlign: 'center',
                fontWeight: '500',
                lineHeight: '18px'
              }}>
              周
            </span>
          </div>
          <div
            data-node-id="5:026279"
            data-name="seg-month"
            style={{
              height: '32px',
              display: 'flex',
              flex: '1',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '16px'
            }}>
            <span
              data-node-id="5:026281"
              data-name="seg-month-label"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '14px',
                fontFamily: 'Inter',
                textAlign: 'center',
                fontWeight: '500',
                lineHeight: '18px'
              }}>
              月
            </span>
          </div>
        </div>
      </div>
      <div
        data-node-id="5:026317"
        data-name="records-list"
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
          data-node-id="5:026319"
          data-name="group-today"
          style={{
            display: 'flex',
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column',
            gap: '10px'
          }}>
          <div
            data-node-id="5:026321"
            data-name="group-header"
            style={{
              display: 'flex',
              alignSelf: 'stretch',
              flexShrink: '0',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <span
              data-node-id="5:026323"
              data-name="group-date"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '20px'
              }}>
              今天·8月5日
            </span>
            <span
              data-node-id="5:026371"
              data-name="group-cal"
              style={{
                flexShrink: '0',
                color: '#34C759',
                fontSize: '13px',
                fontFamily: 'Inter',
                textAlign: 'right',
                fontWeight: '600',
                lineHeight: '18px'
              }}>
              1080 kcal
            </span>
          </div>
          <div
            data-node-id="5:026399"
            data-name="food-card-1"
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
              data-node-id="5:026407"
              data-name="food-thumb-1"
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
                data-node-id="5:025009"
                data-name="food-icon-1"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            <div
              data-node-id="5:026417"
              data-name="food-info-1"
              style={{
                display: 'flex',
                flex: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="5:026419"
                data-name="food-name-1"
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
                data-node-id="5:026455"
                data-name="food-time-1"
                style={{
                  flexShrink: '0',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  lineHeight: '16px'
                }}>
                12:30 · 午餐
              </span>
            </div>
            <div
              data-node-id="5:026492"
              data-name="food-cal-1"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
                gap: '2px'
              }}>
              <span
                data-node-id="5:026494"
                data-name="food-cal-value-1"
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
                data-node-id="5:026525"
                data-name="food-cal-proto-1"
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
          <div
            data-node-id="5:026561"
            data-name="food-card-2"
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
              data-node-id="5:026567"
              data-name="food-thumb-2"
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
                data-node-id="5:025013"
                data-name="food-icon-2"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            <div
              data-node-id="5:026577"
              data-name="food-info-2"
              style={{
                display: 'flex',
                flex: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="5:026579"
                data-name="food-name-2"
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
                data-node-id="5:026615"
                data-name="food-time-2"
                style={{
                  flexShrink: '0',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  lineHeight: '16px'
                }}>
                09:15 · 早餐
              </span>
            </div>
            <div
              data-node-id="5:026651"
              data-name="food-cal-2"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
                gap: '2px'
              }}>
              <span
                data-node-id="5:026653"
                data-name="food-cal-value-2"
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
                data-node-id="5:026683"
                data-name="food-cal-proto-2"
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
          <div
            data-node-id="5:026719"
            data-name="food-card-3"
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
              data-node-id="5:026725"
              data-name="food-thumb-3"
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
                data-node-id="5:026731"
                data-name="food-icon-3"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            <div
              data-node-id="5:026835"
              data-name="food-info-3"
              style={{
                display: 'flex',
                flex: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="5:026837"
                data-name="food-name-3"
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
                data-node-id="5:026874"
                data-name="food-time-3"
                style={{
                  flexShrink: '0',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  lineHeight: '16px'
                }}>
                18:40 · 晚餐
              </span>
            </div>
            <div
              data-node-id="5:026908"
              data-name="food-cal-3"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
                gap: '2px'
              }}>
              <span
                data-node-id="5:026911"
                data-name="food-cal-value-3"
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
                data-node-id="5:026941"
                data-name="food-cal-proto-3"
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
        <div
          data-node-id="5:026975"
          data-name="group-yesterday"
          style={{
            display: 'flex',
            alignSelf: 'stretch',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column',
            gap: '10px'
          }}>
          <div
            data-node-id="5:026979"
            data-name="group-header-2"
            style={{
              display: 'flex',
              alignSelf: 'stretch',
              flexShrink: '0',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <span
              data-node-id="5:026981"
              data-name="group-date-2"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '20px'
              }}>
              昨天·8月4日
            </span>
            <span
              data-node-id="5:027029"
              data-name="group-cal-2"
              style={{
                flexShrink: '0',
                color: '#34C759',
                fontSize: '13px',
                fontFamily: 'Inter',
                textAlign: 'right',
                fontWeight: '600',
                lineHeight: '18px'
              }}>
              930 kcal
            </span>
          </div>
          <div
            data-node-id="5:027059"
            data-name="food-card-4"
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
              data-node-id="5:027065"
              data-name="food-thumb-4"
              style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #FFAB91 0%, #FF8A65 100%)',
                borderRadius: '12px'
              }}>
              <img
                src="./asset/icons/svg_b5812e4e.svg"
                data-node-id="5:026735"
                data-name="food-icon-4"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            <div
              data-node-id="5:027075"
              data-name="food-info-4"
              style={{
                display: 'flex',
                flex: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="5:027077"
                data-name="food-name-4"
                style={{
                  flexShrink: '0',
                  color: '#1A1A1A',
                  fontSize: '15px',
                  fontFamily: 'Inter',
                  fontWeight: '600',
                  lineHeight: '20px'
                }}>
                牛肉汉堡
              </span>
              <span
                data-node-id="5:027114"
                data-name="food-time-4"
                style={{
                  flexShrink: '0',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  lineHeight: '16px'
                }}>
                13:10 · 午餐
              </span>
            </div>
            <div
              data-node-id="5:027148"
              data-name="food-cal-4"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
                gap: '2px'
              }}>
              <span
                data-node-id="5:027150"
                data-name="food-cal-value-4"
                style={{
                  color: '#34C759',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  fontWeight: '700',
                  lineHeight: '22px'
                }}>
                650 kcal
              </span>
              <span
                data-node-id="5:027182"
                data-name="food-cal-proto-4"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  lineHeight: '15px'
                }}>
                蛋白 30g
              </span>
            </div>
          </div>
          <div
            data-node-id="5:027216"
            data-name="food-card-5"
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
              data-node-id="5:027222"
              data-name="food-thumb-5"
              style={{
                width: '56px',
                height: '56px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #FFF9C4 0%, #FFF176 100%)',
                borderRadius: '12px'
              }}>
              <img
                src="./asset/icons/svg_a73c9ff2.svg"
                data-node-id="5:026739"
                data-name="food-icon-5"
                style={{ width: '24px', height: '24px' }}
              />
            </div>
            <div
              data-node-id="5:027233"
              data-name="food-info-5"
              style={{
                display: 'flex',
                flex: '1',
                justifyContent: 'center',
                alignItems: 'flex-start',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="5:027235"
                data-name="food-name-5"
                style={{
                  flexShrink: '0',
                  color: '#1A1A1A',
                  fontSize: '15px',
                  fontFamily: 'Inter',
                  fontWeight: '600',
                  lineHeight: '20px'
                }}>
                时蔬豆腐汤
              </span>
              <span
                data-node-id="5:027271"
                data-name="food-time-5"
                style={{
                  flexShrink: '0',
                  color: '#9CA3AF',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  lineHeight: '16px'
                }}>
                19:20 · 晚餐
              </span>
            </div>
            <div
              data-node-id="5:027307"
              data-name="food-cal-5"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-end',
                flexDirection: 'column',
                gap: '2px'
              }}>
              <span
                data-node-id="5:027309"
                data-name="food-cal-value-5"
                style={{
                  color: '#34C759',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  fontWeight: '700',
                  lineHeight: '22px'
                }}>
                280 kcal
              </span>
              <span
                data-node-id="5:027339"
                data-name="food-cal-proto-5"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'right',
                  lineHeight: '15px'
                }}>
                蛋白 14g
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        data-node-id="5:027375"
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
          data-node-id="5:027379"
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
            src="./asset/icons/svg_ebaf24fd.svg"
            data-node-id="5:026743"
            data-name="nav-home-icon"
            style={{ width: '22px', height: '22px' }}
          />
          <span
            data-node-id="5:027385"
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
          data-node-id="5:027422"
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
            data-node-id="5:026747"
            data-name="nav-record-icon"
            style={{ width: '22px', height: '22px' }}
          />
          <span
            data-node-id="5:027429"
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
          data-node-id="5:027465"
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
            data-node-id="5:026751"
            data-name="nav-discover-icon"
            style={{ width: '22px', height: '22px' }}
          />
          <span
            data-node-id="5:027473"
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
          data-node-id="5:027508"
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
            src="./asset/icons/svg_03494dda.svg"
            data-node-id="5:026755"
            data-name="nav-me-icon"
            style={{ width: '22px', height: '22px' }}
          />
          <span
            data-node-id="5:027517"
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
