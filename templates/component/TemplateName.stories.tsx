import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import Component, { TemplateNameProps } from './TemplateName.component';

const config: Meta<TemplateNameProps> = {
  title: 'Common/TemplateName',
  component: Component,
};

export default config;

const TemplateNameStory: StoryFn<TemplateNameProps> = args => <Component {...args} />;

export const TemplateNameComponent = TemplateNameStory.bind({});
TemplateNameComponent.args = {};
