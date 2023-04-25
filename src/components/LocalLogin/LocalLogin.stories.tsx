import { Meta, StoryFn } from '@storybook/react';
import React from 'react';
import Component, { LocalLoginProps } from './LocalLogin.component';

const config: Meta<LocalLoginProps> = {
  title: 'Common/LocalLogin',
  component: Component,
};

export default config;

const LocalLoginStory: StoryFn<LocalLoginProps> = args => <Component {...args} />;

export const LocalLoginComponent = LocalLoginStory.bind({});
LocalLoginComponent.args = {};
