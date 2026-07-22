import { Button, ColorPicker, Divider, Drawer, Flex, Form, Select, Space, Switch, Tooltip, Typography } from 'antd';
import { Settings } from 'lucide-react';
import { useState } from 'react';

import type { BreadcrumbPlacement, LayoutType } from '@/contexts/LayoutContext';
import { useLayoutSettings } from '@/hooks/useLayoutSettings';

/** 迁移源主应用完整布局调试能力，仅在开发环境展示。 */
export default function LayoutSettingsDrawer() {
  const [open, setOpen] = useState(false);
  const { resetSettings, settings, updateSettings } = useLayoutSettings();

  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <>
      <Tooltip title="布局设置" placement="left">
        <Button
          aria-label="布局设置"
          className="dy-sec-layout-settings-trigger"
          icon={<Settings size="1em" />}
          type="primary"
          onClick={() => {
            setOpen(true);
          }}
        />
      </Tooltip>
      <Drawer
        extra={
          <Button size="small" onClick={resetSettings}>
            重置
          </Button>
        }
        open={open}
        placement="right"
        size={360}
        title="布局设置"
        onClose={() => {
          setOpen(false);
        }}
      >
        <Form layout="vertical">
          <Form.Item label="布局模式">
            <Select<LayoutType>
              aria-label="布局模式"
              options={[
                { label: '混合导航', value: 'mix' },
                { label: '左侧全量导航', value: 'side' },
                { label: '左侧紧凑导航', value: 'side-compact' },
                { label: '顶部导航', value: 'top' },
              ]}
              value={settings.layout}
              onChange={(layout) => {
                updateSettings({ layout });
              }}
            />
          </Form.Item>
          <Form.Item label="面包屑位置" extra="Header 位置仅在左侧全量和左侧紧凑导航中生效。">
            <Select<BreadcrumbPlacement>
              aria-label="面包屑位置"
              options={[
                { label: 'Header 区', value: 'header' },
                { label: '内容区', value: 'content' },
              ]}
              value={settings.breadcrumbPlacement}
              onChange={(breadcrumbPlacement) => {
                updateSettings({ breadcrumbPlacement });
              }}
            />
          </Form.Item>
          <Form.Item label="主题">
            <Select
              aria-label="主题"
              options={[
                { label: '亮色', value: 'light' },
                { label: '暗色', value: 'dark' },
              ]}
              value={settings.theme}
              onChange={(theme: 'light' | 'dark') => {
                updateSettings({ theme });
              }}
            />
          </Form.Item>
          <Form.Item label="主色调">
            <ColorPicker
              showText
              style={{ width: '100%' }}
              value={settings.primaryColor}
              onChange={(color) => {
                updateSettings({ primaryColor: color.toHexString() });
              }}
            />
          </Form.Item>
          <Divider />
          <Form.Item>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Flex align="center" justify="space-between">
                <Typography.Text>固定头部</Typography.Text>
                <Switch
                  aria-label="固定头部"
                  checked={settings.fixedHeader}
                  onChange={(fixedHeader) => {
                    updateSettings({ fixedHeader });
                  }}
                />
              </Flex>
              <Flex align="center" justify="space-between">
                <Typography.Text>固定侧边栏</Typography.Text>
                <Switch
                  aria-label="固定侧边栏"
                  checked={settings.fixedSidebar}
                  disabled={settings.layout === 'top'}
                  onChange={(fixedSidebar) => {
                    updateSettings({ fixedSidebar });
                  }}
                />
              </Flex>
              <Flex align="center" justify="space-between">
                <Typography.Text>自动分割菜单</Typography.Text>
                <Switch
                  aria-label="自动分割菜单"
                  checked={settings.splitMenus}
                  disabled={settings.layout !== 'mix'}
                  onChange={(splitMenus) => {
                    updateSettings({ splitMenus });
                  }}
                />
              </Flex>
              <Flex align="center" justify="space-between">
                <Typography.Text>顶部菜单居中</Typography.Text>
                <Switch
                  aria-label="顶部菜单居中"
                  checked={settings.centerTopMenu}
                  disabled={settings.layout !== 'mix'}
                  onChange={(centerTopMenu) => {
                    updateSettings({ centerTopMenu });
                  }}
                />
              </Flex>
            </Space>
          </Form.Item>
          <Divider />
          <Typography.Paragraph type="secondary">
            四种布局共享同一个 Shell 根节点，切换设置不会卸载当前业务页面。
          </Typography.Paragraph>
        </Form>
      </Drawer>
    </>
  );
}
