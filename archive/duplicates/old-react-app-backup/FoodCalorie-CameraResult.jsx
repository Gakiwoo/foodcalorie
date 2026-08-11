import React from 'react';

export default function FoodCalorieCameraResult() {
  return (
    <div
      data-node-id="12:13437"
      data-name="FoodCalorie-CameraResult"
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
        data-node-id="12:13443"
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
          data-node-id="12:13445"
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
          data-node-id="12:13478"
          data-name="status-icons"
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: '6px'
          }}>
          <img
            src="./asset/icons/svg_dafe2afa.svg"
            data-node-id="12:12949"
            data-name="icon-signal"
            style={{ width: '14px', height: '14px' }}
          />
          <img
            src="./asset/icons/svg_7d24f493.svg"
            data-node-id="12:12953"
            data-name="icon-wifi"
            style={{ width: '14px', height: '14px' }}
          />
          <img
            src="./asset/icons/svg_c23974ea.svg"
            data-node-id="12:12957"
            data-name="icon-battery"
            style={{ width: '14px', height: '14px' }}
          />
        </div>
      </div>
      <div
        data-node-id="12:13493"
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
          data-node-id="12:12961"
          data-name="nav-back"
          style={{ width: '22px', height: '22px' }}
        />
        <p
          data-node-id="12:13499"
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
          识别结果
        </p>
        <img
          src="./asset/icons/svg_79acdb7d.svg"
          data-node-id="12:12965"
          data-name="nav-share"
          style={{ width: '18px', height: '18px' }}
        />
      </div>
      <div
        data-node-id="12:13547"
        data-name="photo-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          paddingTop: '4px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="12:13549"
          data-name="photo-card"
          style={{
            width: '335px',
            height: '200px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(121deg, #FFE0B2 0%, #FFCC80 100%)',
            borderRadius: '16px'
          }}>
          <img
            src="./asset/icons/svg_b867c145.svg"
            data-node-id="12:12969"
            data-name="photo-icon"
            style={{ width: '64px', height: '64px' }}
          />
        </div>
      </div>
      <div
        data-node-id="12:13558"
        data-name="ai-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          paddingTop: '4px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="12:13560"
          data-name="ai-row"
          style={{
            display: 'flex',
            alignSelf: 'stretch',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
          <div
            data-node-id="12:13562"
            data-name="ai-tag"
            style={{
              height: '26px',
              display: 'flex',
              flexShrink: '0',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              paddingRight: '10px',
              paddingLeft: '10px',
              background: '#E8F5EC',
              borderRadius: '13px'
            }}>
            <img
              src="./asset/icons/svg_6367ca76.svg"
              data-node-id="12:12973"
              data-name="ai-tag-icon"
              style={{ width: '11px', height: '11px' }}
            />
            <span
              data-node-id="12:13570"
              data-name="ai-tag-text"
              style={{
                color: '#22A85A',
                fontSize: '12px',
                fontFamily: 'Inter',
                textAlign: 'center',
                fontWeight: '600',
                lineHeight: '16px'
              }}>
              AI 智能识别
            </span>
          </div>
          <div
            data-node-id="12:13608"
            data-name="confidence-row"
            style={{
              display: 'flex',
              flexShrink: '0',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '4px'
            }}>
            <span
              data-node-id="12:13611"
              data-name="confidence-label"
              style={{
                color: '#9CA3AF',
                fontSize: '11px',
                fontFamily: 'Inter',
                textAlign: 'right',
                lineHeight: '15px'
              }}>
              置信度
            </span>
            <span
              data-node-id="12:13648"
              data-name="confidence-value"
              style={{
                color: '#22A85A',
                fontSize: '13px',
                fontFamily: 'Inter',
                textAlign: 'right',
                fontWeight: '700',
                lineHeight: '18px'
              }}>
              92%
            </span>
          </div>
        </div>
      </div>
      <div
        data-node-id="12:13681"
        data-name="name-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          paddingTop: '4px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="12:13685"
          data-name="name-card"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '14px',
            paddingBottom: '14px',
            paddingRight: '16px',
            paddingLeft: '16px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:13691"
            data-name="name-info"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'column',
              gap: '4px'
            }}>
            <span
              data-node-id="12:13693"
              data-name="name-title"
              style={{
                color: '#1A1A1A',
                fontSize: '18px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '24px'
              }}>
              红烧牛肉面
            </span>
            <span
              data-node-id="12:13732"
              data-name="name-meta"
              style={{
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                lineHeight: '16px'
              }}>
              午餐 · 中式面食
            </span>
          </div>
          <div
            data-node-id="12:13775"
            data-name="name-portion"
            style={{
              height: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '6px',
              paddingRight: '12px',
              paddingLeft: '12px',
              background: '#F7F8FA',
              borderRadius: '15px'
            }}>
            <img
              src="./asset/icons/svg_62f33091.svg"
              data-node-id="12:12977"
              data-name="name-portion-icon"
              style={{ width: '12px', height: '12px' }}
            />
            <span
              data-node-id="12:13784"
              data-name="name-portion-text"
              style={{
                color: '#1A1A1A',
                fontSize: '13px',
                fontFamily: 'Inter',
                textAlign: 'center',
                fontWeight: '600',
                lineHeight: '18px'
              }}>
              1 份
            </span>
            <img
              src="./asset/icons/svg_60d7995f.svg"
              data-node-id="12:12981"
              data-name="name-portion-plus"
              style={{ width: '12px', height: '12px' }}
            />
          </div>
        </div>
      </div>
      <div
        data-node-id="12:13827"
        data-name="nutrition-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          paddingTop: '4px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="12:13829"
          data-name="nutrition-card"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:13835"
            data-name="nutrition-header"
            style={{
              width: '335px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '14px',
              paddingBottom: '12px',
              paddingRight: '16px',
              paddingLeft: '16px'
            }}>
            <span
              data-node-id="12:13837"
              data-name="nutrition-title"
              style={{
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '20px'
              }}>
              营养数据
            </span>
            <span
              data-node-id="12:13876"
              data-name="nutrition-portion"
              style={{
                color: '#9CA3AF',
                fontSize: '11px',
                fontFamily: 'Inter',
                textAlign: 'right',
                lineHeight: '15px'
              }}>
              每份
            </span>
          </div>
          <div
            data-node-id="12:13914"
            data-name="nutrition-grid"
            style={{
              width: '335px',
              display: 'flex',
              flex: 'none',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              paddingBottom: '14px',
              paddingRight: '16px',
              paddingLeft: '16px'
            }}>
            <div
              data-node-id="12:13916"
              data-name="nutri-1"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="12:13918"
                data-name="nutri-1-val"
                style={{
                  color: '#34C759',
                  fontSize: '18px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '700',
                  lineHeight: '22px'
                }}>
                520
              </span>
              <span
                data-node-id="12:13949"
                data-name="nutri-1-label"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  lineHeight: '15px'
                }}>
                卡路里
              </span>
            </div>
            <div
              data-node-id="12:13984"
              data-name="nutri-divider-1"
              style={{
                width: '1px',
                height: '32px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexDirection: 'column',
                background: '#EEF0F2'
              }}></div>
            <div
              data-node-id="12:13988"
              data-name="nutri-2"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="12:13991"
                data-name="nutri-2-val"
                style={{
                  color: '#1A1A1A',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '700',
                  lineHeight: '20px'
                }}>
                28g
              </span>
              <span
                data-node-id="12:14022"
                data-name="nutri-2-label"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  lineHeight: '15px'
                }}>
                蛋白质
              </span>
            </div>
            <div
              data-node-id="12:14057"
              data-name="nutri-divider-2"
              style={{
                width: '1px',
                height: '32px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexDirection: 'column',
                background: '#EEF0F2'
              }}></div>
            <div
              data-node-id="12:14063"
              data-name="nutri-3"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="12:14065"
                data-name="nutri-3-val"
                style={{
                  color: '#1A1A1A',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '700',
                  lineHeight: '20px'
                }}>
                65g
              </span>
              <span
                data-node-id="12:14095"
                data-name="nutri-3-label"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  lineHeight: '15px'
                }}>
                碳水
              </span>
            </div>
            <div
              data-node-id="12:14130"
              data-name="nutri-divider-3"
              style={{
                width: '1px',
                height: '32px',
                display: 'flex',
                flex: 'none',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                flexDirection: 'column',
                background: '#EEF0F2'
              }}></div>
            <div
              data-node-id="12:14136"
              data-name="nutri-4"
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                gap: '4px'
              }}>
              <span
                data-node-id="12:14138"
                data-name="nutri-4-val"
                style={{
                  color: '#1A1A1A',
                  fontSize: '16px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '700',
                  lineHeight: '20px'
                }}>
                18g
              </span>
              <span
                data-node-id="12:14168"
                data-name="nutri-4-label"
                style={{
                  color: '#9CA3AF',
                  fontSize: '11px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  lineHeight: '15px'
                }}>
                脂肪
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        data-node-id="12:14203"
        data-name="ingredients-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
          flexDirection: 'column',
          paddingTop: '4px',
          paddingBottom: '8px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="12:14207"
          data-name="ingredients-card"
          style={{
            width: '335px',
            display: 'flex',
            flex: 'none',
            justifyContent: 'flex-start',
            alignItems: 'flex-start',
            flexDirection: 'column',
            gap: '10px',
            paddingTop: '14px',
            paddingBottom: '14px',
            paddingRight: '16px',
            paddingLeft: '16px',
            background: '#FFFFFF',
            borderRadius: '16px',
            boxShadow: '0px 4px 14px 0px rgba(0,0,0,0.05)'
          }}>
          <div
            data-node-id="12:14213"
            data-name="ingredients-header"
            style={{
              display: 'flex',
              alignSelf: 'stretch',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <span
              data-node-id="12:14215"
              data-name="ingredients-title"
              style={{
                flexShrink: '0',
                color: '#1A1A1A',
                fontSize: '15px',
                fontFamily: 'Inter',
                fontWeight: '700',
                lineHeight: '20px'
              }}>
              AI 检测食材
            </span>
            <span
              data-node-id="12:14253"
              data-name="ingredients-count"
              style={{
                flexShrink: '0',
                color: '#9CA3AF',
                fontSize: '12px',
                fontFamily: 'Inter',
                textAlign: 'right',
                lineHeight: '16px'
              }}>
              3 种
            </span>
          </div>
          <div
            data-node-id="12:14291"
            data-name="ingredients-row"
            style={{
              display: 'flex',
              alignSelf: 'stretch',
              justifyContent: 'flex-start',
              alignItems: 'center',
              gap: '8px'
            }}>
            <div
              data-node-id="12:14293"
              data-name="chip-1"
              style={{
                height: '30px',
                display: 'flex',
                flexShrink: '0',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                paddingRight: '12px',
                paddingLeft: '12px',
                background: '#E8F5EC',
                borderRadius: '15px'
              }}>
              <img
                src="./asset/icons/svg_706c9155.svg"
                data-node-id="12:12985"
                data-name="chip-1-icon"
                style={{ width: '11px', height: '11px' }}
              />
              <span
                data-node-id="12:14301"
                data-name="chip-1-text"
                style={{
                  color: '#22A85A',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '600',
                  lineHeight: '16px'
                }}>
                米饭
              </span>
            </div>
            <div
              data-node-id="12:14338"
              data-name="chip-2"
              style={{
                height: '30px',
                display: 'flex',
                flexShrink: '0',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                paddingRight: '12px',
                paddingLeft: '12px',
                background: '#FFE8EC',
                borderRadius: '15px'
              }}>
              <img
                src="./asset/icons/svg_b240f704.svg"
                data-node-id="12:12989"
                data-name="chip-2-icon"
                style={{ width: '11px', height: '11px' }}
              />
              <span
                data-node-id="12:14347"
                data-name="chip-2-text"
                style={{
                  color: '#E91E63',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '600',
                  lineHeight: '16px'
                }}>
                牛肉
              </span>
            </div>
            <div
              data-node-id="12:14384"
              data-name="chip-3"
              style={{
                height: '30px',
                display: 'flex',
                flexShrink: '0',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                paddingRight: '12px',
                paddingLeft: '12px',
                background: '#DCFCE7',
                borderRadius: '15px'
              }}>
              <img
                src="./asset/icons/svg_665b64ea.svg"
                data-node-id="12:12993"
                data-name="chip-3-icon"
                style={{ width: '11px', height: '11px' }}
              />
              <span
                data-node-id="12:14397"
                data-name="chip-3-text"
                style={{
                  color: '#16A34A',
                  fontSize: '12px',
                  fontFamily: 'Inter',
                  textAlign: 'center',
                  fontWeight: '600',
                  lineHeight: '16px'
                }}>
                青菜
              </span>
            </div>
          </div>
        </div>
      </div>
      <div
        data-node-id="12:14435"
        data-name="actions-section"
        style={{
          width: '375px',
          display: 'flex',
          flex: 'none',
          justifyContent: 'flex-start',
          alignItems: 'center',
          gap: '12px',
          paddingTop: '12px',
          paddingBottom: '20px',
          paddingRight: '20px',
          paddingLeft: '20px'
        }}>
        <div
          data-node-id="12:14437"
          data-name="btn-retake"
          style={{
            height: '48px',
            display: 'flex',
            flex: '1',
            justifyContent: 'center',
            alignItems: 'center',
            borderStyle: 'solid',
            borderColor: '#E5E7EB',
            borderWidth: '1.5px',
            borderRadius: '16px'
          }}>
          <span
            data-node-id="12:14447"
            data-name="btn-retake-text"
            style={{
              flexShrink: '0',
              color: '#1A1A1A',
              fontSize: '15px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '600',
              lineHeight: '20px'
            }}>
            重新拍照
          </span>
        </div>
        <div
          data-node-id="12:14485"
          data-name="btn-confirm"
          style={{
            height: '48px',
            display: 'flex',
            flex: '1',
            justifyContent: 'center',
            alignItems: 'center',
            background: '#34C759',
            borderRadius: '16px'
          }}>
          <span
            data-node-id="12:14489"
            data-name="btn-confirm-text"
            style={{
              flexShrink: '0',
              color: '#FFFFFF',
              fontSize: '15px',
              fontFamily: 'Inter',
              textAlign: 'center',
              fontWeight: '700',
              lineHeight: '20px'
            }}>
            确认添加
          </span>
        </div>
      </div>
    </div>
  );
}
