import { Button, Empty, Flex, Popover, Spin, Typography } from 'antd';
import { Bell, FileCheck, Grip, Monitor, ScanLine, ShieldCheck, SlidersHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { useLayoutSettings } from '@/hooks/useLayoutSettings';
import type { ShellSiblingAppPortal } from '@/types/shell';

interface ShellAppSwitchProps {
  /**
   * 外部传入的应用切换入口，传入 false 时不渲染。
   */
  content?: ReactNode | false;
}

function fetchAppPortals(): Promise<ShellSiblingAppPortal[]> {
  return Promise.resolve([
    {
      key: 'security-posture',
      title: '安全态势',
      description: '资产态势、威胁趋势与安全评分总览',
      url: '/security-posture',
      icon: <ShieldCheck size="1em" />,
    },
    {
      key: 'asset-center',
      title: '资产管理',
      description: 'IT资产发现、资产台账与暴露面管理',
      url: '/asset-center',
      icon: <Monitor size="1em" />,
    },
    {
      key: 'threat-center',
      title: '威胁中心',
      description: '安全告警、事件调查与威胁情报',
      url: '/threat-center',
      icon: <Bell size="1em" />,
    },
    {
      key: 'vulnerability-management',
      title: '漏洞管理',
      description: '漏洞扫描、修复跟踪与风险闭环',
      url: '/vulnerability-management',
      icon: <ScanLine size="1em" />,
    },
    {
      key: 'compliance-audit',
      title: '合规审计',
      description: '等保合规、日志审计与报表导出',
      url: '/compliance-audit',
      icon: <FileCheck size="1em" />,
    },
    {
      key: 'policy-management',
      title: '策略管理',
      description: '安全策略、检测规则与响应编排',
      url: '/policy-management',
      icon: <SlidersHorizontal size="1em" />,
    },
  ]);
}

/**
 * 渲染左侧应用切换入口占位。
 */
export default function ShellAppSwitch({ content }: ShellAppSwitchProps) {
  const { settings } = useLayoutSettings();
  const mountedRef = useRef(true);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [portals, setPortals] = useState<ShellSiblingAppPortal[]>([]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen || loading || portals.length > 0) {
      return;
    }

    setLoading(true);

    void fetchAppPortals()
      .then((items) => {
        if (mountedRef.current) {
          setPortals(items);
        }
      })
      .finally(() => {
        if (mountedRef.current) {
          setLoading(false);
        }
      });
  }

  const popoverContent = useMemo(() => {
    if (loading) {
      return (
        <Flex
          className="dy-sec-shell-app-switch-portal dy-sec-shell-app-switch-portal--loading"
          align="center"
          justify="center"
        >
          <Spin size="small" />
        </Flex>
      );
    }

    if (portals.length === 0) {
      return (
        <div className="dy-sec-shell-app-switch-portal">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无可切换应用" />
        </div>
      );
    }

    return (
      <div className="dy-sec-shell-app-switch-portal">
        <div className="dy-sec-shell-app-switch-portal__grid">
          {portals.map((portal) => (
            <a
              key={portal.key}
              className="dy-sec-shell-app-switch-portal__item"
              href={portal.url}
              target={portal.target ? '_blank' : undefined}
              rel={portal.target ? 'noreferrer' : undefined}
              onClick={() => {
                setOpen(false);
              }}
            >
              {portal.icon && <span className="dy-sec-shell-app-switch-portal__icon">{portal.icon}</span>}
              <span className="dy-sec-shell-app-switch-portal__body">
                <Typography.Text className="dy-sec-shell-app-switch-portal__title">{portal.title}</Typography.Text>
                {portal.description && (
                  <Typography.Text className="dy-sec-shell-app-switch-portal__description" type="secondary">
                    {portal.description}
                  </Typography.Text>
                )}
              </span>
            </a>
          ))}
        </div>
      </div>
    );
  }, [loading, portals]);

  if (content === false) {
    return null;
  }

  return (
    <Flex className="dy-sec-shell-brand__app-switch" align="center">
      {content ?? (
        <Popover
          open={open}
          onOpenChange={handleOpenChange}
          arrow={false}
          trigger="click"
          placement="bottomLeft"
          content={popoverContent}
          classNames={{
            root: `dy-sec-shell-app-switch-popover dy-sec-shell-app-switch-popover--${settings.theme}`,
          }}
        >
          <Button
            aria-label="应用切换"
            className="dy-sec-shell-action-button"
            type="text"
            size="small"
            icon={<Grip className="dy-sec-shell-action-icon" size="1em" />}
          />
        </Popover>
      )}
    </Flex>
  );
}
