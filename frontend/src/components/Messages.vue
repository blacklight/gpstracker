<template>
  <div class="messages">
    <div class="message"
         :class="messageClasses[message.id]"
         v-for="message in messages"
         :key="message.id">
      <PopupMessage :icon="message.icon"
                    :isError="message.isError"
                    @click="onClick(message.id)">
        {{ message.content }}
      </PopupMessage>
    </div>
  </div>
</template>

<script lang="ts">
import Message from '../models/Message';
import PopupMessage from '../elements/PopupMessage.vue';

export default {
  components: {
    PopupMessage,
  },

  data() {
    return {
      messageClasses: {} as { [key: string]: string },
      messages: [] as Message[],
    };
  },

  computed: {
    messageIndexById(): { [key: string]: number } {
      return this.messages.reduce(
        (acc: { [key: string]: number }, message: Message, index: number) => {
          acc[message.id] = index;
          return acc;
        },
        {} as { [key: string]: number }
      );
    },
  },

  methods: {
    addMessage(message: any) {
      if (!(message instanceof Message)) {
        message = new Message(message);
      }

      this.messages.push(message);
      if (message.timeout) {
        setTimeout(
          () => this.removeMessage(message.id),
          message.timeout
        );
      }
    },

    removeMessage(id: string, timeout: number = 500) {
      const msg = this.messages[this.messageIndexById[id]];
      this.messageClasses[id] = 'remove';
      setTimeout(
        () => {
          const index = this.messageIndexById[msg?.id]
          if (index != null) {
            this.messages.splice(index, 1)
          }
        }, timeout
      );
    },

    onClick(id: string) {
      const msg = this.messages[this.messageIndexById[id]];
      msg.onClick && msg.onClick();
      this.removeMessage(id, 0);
    },
  },

  mounted() {
    // @ts-ignore
    this.$msgBus.on('message', this.addMessage);
  },
}
</script>

<style scoped lang="scss">
.messages {
  position: fixed;
  bottom: 1rem;
  right: 1rem;
  z-index: 1000;

  .message {
    margin-top: 0.5rem;
    animation: slide-up 0.5s ease-out;

    &.remove {
      animation: slide-down 0.5s ease-out;
    }
  }
}
</style>
