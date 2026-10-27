use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_name = AudioContext)]
    pub type JsAudioContext;

    #[wasm_bindgen(constructor, catch, js_class = "AudioContext")]
    pub fn new() -> Result<JsAudioContext, JsValue>;

    #[wasm_bindgen(method, getter, js_name = currentTime)]
    pub fn current_time(this: &JsAudioContext) -> f64;

    #[wasm_bindgen(method, getter, js_name = sampleRate)]
    pub fn sample_rate(this: &JsAudioContext) -> f32;

    #[wasm_bindgen(method, getter)]
    pub fn state(this: &JsAudioContext) -> String;

    #[wasm_bindgen(method, catch)]
    pub fn resume(this: &JsAudioContext) -> Result<JsValue, JsValue>;

    #[wasm_bindgen(method, getter)]
    pub fn destination(this: &JsAudioContext) -> JsAudioNode;

    #[wasm_bindgen(method, js_name = createGain)]
    pub fn create_gain(this: &JsAudioContext) -> JsGainNode;

    #[wasm_bindgen(method, js_name = createOscillator)]
    pub fn create_oscillator(this: &JsAudioContext) -> JsOscillatorNode;

    #[wasm_bindgen(method, js_name = createBiquadFilter)]
    pub fn create_biquad_filter(this: &JsAudioContext) -> JsBiquadFilterNode;

    #[wasm_bindgen(method, js_name = createBuffer)]
    pub fn create_buffer(
        this: &JsAudioContext,
        channels: u32,
        length: u32,
        sample_rate: f32,
    ) -> JsAudioBuffer;

    #[wasm_bindgen(method, js_name = createBufferSource)]
    pub fn create_buffer_source(this: &JsAudioContext) -> JsAudioBufferSourceNode;

    pub type JsAudioNode;

    #[wasm_bindgen(extends = JsAudioNode)]
    pub type JsGainNode;

    #[wasm_bindgen(method, getter)]
    pub fn gain(this: &JsGainNode) -> JsAudioParam;

    #[wasm_bindgen(method)]
    pub fn connect(this: &JsGainNode, dest: &JsAudioNode);

    #[wasm_bindgen(extends = JsAudioNode)]
    pub type JsOscillatorNode;

    #[wasm_bindgen(method, setter, js_name = type)]
    pub fn set_type(this: &JsOscillatorNode, osc_type: &str);

    #[wasm_bindgen(method, getter)]
    pub fn frequency(this: &JsOscillatorNode) -> JsAudioParam;

    #[wasm_bindgen(method, js_name = connect)]
    pub fn connect_osc(this: &JsOscillatorNode, dest: &JsAudioNode);

    #[wasm_bindgen(method)]
    pub fn start(this: &JsOscillatorNode, when: f64);

    #[wasm_bindgen(method)]
    pub fn stop(this: &JsOscillatorNode, when: f64);

    #[wasm_bindgen(extends = JsAudioNode)]
    pub type JsBiquadFilterNode;

    #[wasm_bindgen(method, setter, js_name = type)]
    pub fn set_filter_type(this: &JsBiquadFilterNode, filter_type: &str);

    #[wasm_bindgen(method, getter)]
    pub fn frequency(this: &JsBiquadFilterNode) -> JsAudioParam;

    #[wasm_bindgen(method, js_name = connect)]
    pub fn connect_filter(this: &JsBiquadFilterNode, dest: &JsAudioNode);

    pub type JsAudioBuffer;

    #[wasm_bindgen(method, js_name = copyToChannel)]
    pub fn copy_to_channel(this: &JsAudioBuffer, source: &[f32], channel_number: i32);

    #[wasm_bindgen(extends = JsAudioNode)]
    pub type JsAudioBufferSourceNode;

    #[wasm_bindgen(method, setter)]
    pub fn set_buffer(this: &JsAudioBufferSourceNode, buffer: &JsAudioBuffer);

    #[wasm_bindgen(method, js_name = connect)]
    pub fn connect_source(this: &JsAudioBufferSourceNode, dest: &JsAudioNode);

    #[wasm_bindgen(method, js_name = start)]
    pub fn start_source(this: &JsAudioBufferSourceNode, when: f64);

    #[wasm_bindgen(method, js_name = stop)]
    pub fn stop_source(this: &JsAudioBufferSourceNode, when: f64);

    pub type JsAudioParam;

    #[wasm_bindgen(method, js_name = setValueAtTime)]
    pub fn set_value_at_time(this: &JsAudioParam, value: f32, start_time: f64);

    #[wasm_bindgen(method, js_name = linearRampToValueAtTime)]
    pub fn linear_ramp_to_value_at_time(this: &JsAudioParam, value: f32, end_time: f64);

    #[wasm_bindgen(method, js_name = exponentialRampToValueAtTime)]
    pub fn exponential_ramp_to_value_at_time(this: &JsAudioParam, value: f32, end_time: f64);
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct RecordedSoundEvent {
    pub sound: String,
    pub time: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub detail: Option<String>,
}

pub struct RustSoundSystem {
    pub sound_enabled: bool,
    pub sound_volume: f32,
    pub recorded_events: Vec<RecordedSoundEvent>,
    last_play_times: HashMap<String, f64>,
    clock_ms: f64,
    #[cfg(target_arch = "wasm32")]
    audio_ctx: Option<JsAudioContext>,
    #[cfg(target_arch = "wasm32")]
    master_gain: Option<JsGainNode>,
    #[cfg(target_arch = "wasm32")]
    noise_buffer: Option<JsAudioBuffer>,
}

impl Default for RustSoundSystem {
    fn default() -> Self {
        Self::new()
    }
}

impl RustSoundSystem {
    pub fn new() -> Self {
        RustSoundSystem {
            sound_enabled: true,
            sound_volume: 0.7,
            recorded_events: Vec::with_capacity(64),
            last_play_times: HashMap::new(),
            clock_ms: 0.0,
            #[cfg(target_arch = "wasm32")]
            audio_ctx: None,
            #[cfg(target_arch = "wasm32")]
            master_gain: None,
            #[cfg(target_arch = "wasm32")]
            noise_buffer: None,
        }
    }

    pub fn advance_clock(&mut self, dt_sec: f32) {
        self.clock_ms += (dt_sec as f64) * 1000.0;
    }

    fn now_ms(&self) -> f64 {
        #[cfg(target_arch = "wasm32")]
        {
            js_sys::Date::now()
        }
        #[cfg(not(target_arch = "wasm32"))]
        {
            self.clock_ms
        }
    }

    fn record(&mut self, sound: &str, detail: Option<String>) {
        let time = self.now_ms();
        self.recorded_events.push(RecordedSoundEvent {
            sound: sound.to_string(),
            time,
            detail,
        });
        if self.recorded_events.len() > 50 {
            self.recorded_events.remove(0);
        }
    }

    fn should_throttle(&mut self, category: &str, min_interval_ms: f64) -> bool {
        let now = self.now_ms();
        if let Some(&last) = self.last_play_times.get(category) {
            if now - last < min_interval_ms && now >= last {
                return true;
            }
        }
        self.last_play_times.insert(category.to_string(), now);
        false
    }

    pub fn init(&mut self) {
        #[cfg(target_arch = "wasm32")]
        {
            if self.audio_ctx.is_none() {
                if let Ok(ctx) = JsAudioContext::new() {
                    let gain = ctx.create_gain();
                    let initial_vol = if self.sound_enabled {
                        self.sound_volume
                    } else {
                        0.0
                    };
                    gain.gain()
                        .set_value_at_time(initial_vol, ctx.current_time());
                    gain.connect(&ctx.destination());

                    let rate = ctx.sample_rate();
                    let len = (rate * 1.5) as u32;
                    let buf = ctx.create_buffer(1, len, rate);
                    let mut samples = Vec::with_capacity(len as usize);
                    let mut seed = 0x1234_5678u64;
                    for _ in 0..len {
                        seed ^= seed << 13;
                        seed ^= seed >> 7;
                        seed ^= seed << 17;
                        let v = ((seed & 0xFFFF) as f32 / 32768.0) - 1.0;
                        samples.push(v);
                    }
                    buf.copy_to_channel(&samples, 0);

                    self.master_gain = Some(gain);
                    self.noise_buffer = Some(buf);
                    self.audio_ctx = Some(ctx);
                }
            }

            if let Some(ref ctx) = self.audio_ctx {
                if ctx.state() == "suspended" {
                    let _ = ctx.resume();
                }
            }
        }
    }

    pub fn set_enabled(&mut self, enabled: bool) {
        self.sound_enabled = enabled;
        #[cfg(target_arch = "wasm32")]
        {
            if let (Some(ref ctx), Some(ref gain)) = (&self.audio_ctx, &self.master_gain) {
                let target_vol = if self.sound_enabled {
                    self.sound_volume
                } else {
                    0.0
                };
                gain.gain()
                    .set_value_at_time(target_vol, ctx.current_time());
            }
        }
        self.record("SET_ENABLED", Some(enabled.to_string()));
    }

    pub fn set_volume(&mut self, volume: f32) {
        self.sound_volume = volume.clamp(0.0, 1.0);
        #[cfg(target_arch = "wasm32")]
        {
            if let (Some(ref ctx), Some(ref gain)) = (&self.audio_ctx, &self.master_gain) {
                let target_vol = if self.sound_enabled {
                    self.sound_volume
                } else {
                    0.0
                };
                gain.gain()
                    .set_value_at_time(target_vol, ctx.current_time());
            }
        }
        self.record("SET_VOLUME", Some(format!("{:.2}", self.sound_volume)));
    }

    #[cfg(target_arch = "wasm32")]
    fn play_tone_ramp(
        &self,
        osc_type: &str,
        f_start: f32,
        f_end: f32,
        gain_start: f32,
        dur: f64,
        offset: f64,
    ) {
        let (Some(ref ctx), Some(ref master)) = (&self.audio_ctx, &self.master_gain) else {
            return;
        };
        let now = ctx.current_time() + offset;
        let osc = ctx.create_oscillator();
        let gain = ctx.create_gain();
        osc.set_type(osc_type);
        osc.frequency().set_value_at_time(f_start, now);
        if (f_end - f_start).abs() > 0.5 {
            osc.frequency()
                .exponential_ramp_to_value_at_time(f_end.max(1.0), now + dur);
        }
        gain.gain().set_value_at_time(gain_start, now);
        gain.gain()
            .exponential_ramp_to_value_at_time(0.001, now + dur);

        osc.connect_osc(&gain);
        gain.connect(master);
        osc.start(now);
        osc.stop(now + dur + 0.01);
    }

    pub fn play_shoot(&mut self, shoot_type: &str) {
        self.record("SHOOT", Some(shoot_type.to_string()));
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle(&format!("shoot_{}", shoot_type), 50.0) {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            match shoot_type {
                "ARCHER" => self.play_tone_ramp("triangle", 480.0, 140.0, 0.28, 0.12, 0.0),
                "MAGE" => self.play_tone_ramp("sine", 520.0, 880.0, 0.25, 0.20, 0.0),
                "ARTILLERY" => self.play_tone_ramp("sawtooth", 130.0, 40.0, 0.35, 0.28, 0.0),
                _ => self.play_tone_ramp("triangle", 360.0, 160.0, 0.22, 0.10, 0.0),
            }
        }
    }

    pub fn play_hit(&mut self, is_immune: bool, is_reaction: bool, is_melee: bool) {
        self.record(
            "HIT",
            Some(format!(
                "immune={},reaction={},melee={}",
                is_immune, is_reaction, is_melee
            )),
        );
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }

        if is_immune {
            if self.should_throttle("hit_immune", 70.0) {
                return;
            }
            self.init();
            #[cfg(target_arch = "wasm32")]
            self.play_tone_ramp("square", 980.0, 640.0, 0.18, 0.08, 0.0);
            return;
        }

        if is_reaction {
            if self.should_throttle("hit_reaction", 60.0) {
                return;
            }
            self.init();
            #[cfg(target_arch = "wasm32")]
            self.play_tone_ramp("sine", 650.0, 1300.0, 0.30, 0.16, 0.0);
            return;
        }

        if self.should_throttle("hit_normal", 45.0) {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            let osc_t = if is_melee { "triangle" } else { "sine" };
            let f_s = if is_melee { 220.0 } else { 320.0 };
            self.play_tone_ramp(osc_t, f_s, 90.0, 0.18, 0.07, 0.0);
        }
    }

    pub fn play_explosion(&mut self, scale: &str) {
        self.record("EXPLOSION", Some(scale.to_string()));
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle("explosion", 70.0) {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            let is_large = scale == "LARGE";
            let dur = if is_large { 0.45 } else { 0.28 };
            if let (Some(ref ctx), Some(ref master), Some(ref nbuf)) =
                (&self.audio_ctx, &self.master_gain, &self.noise_buffer)
            {
                let now = ctx.current_time();
                let src = ctx.create_buffer_source();
                src.set_buffer(nbuf);
                let filter = ctx.create_biquad_filter();
                filter.set_filter_type("lowpass");
                filter
                    .frequency()
                    .set_value_at_time(if is_large { 380.0 } else { 500.0 }, now);
                filter
                    .frequency()
                    .exponential_ramp_to_value_at_time(70.0, now + dur);

                let gain = ctx.create_gain();
                gain.gain()
                    .set_value_at_time(if is_large { 0.42 } else { 0.28 }, now);
                gain.gain()
                    .exponential_ramp_to_value_at_time(0.001, now + dur);

                src.connect_source(&filter);
                filter.connect_filter(&gain);
                gain.connect(master);
                src.start_source(now);
                src.stop_source(now + dur + 0.02);
            }
            self.play_tone_ramp("sine", 110.0, 35.0, 0.30, dur, 0.0);
        }
    }

    pub fn play_trap_trigger(&mut self, trap_type: &str) {
        self.record("TRAP_TRIGGER", Some(trap_type.to_string()));
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle(&format!("trap_{}", trap_type), 80.0) {
            return;
        }
        if trap_type == "TRAP_FIRE" {
            self.play_explosion("LARGE");
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            match trap_type {
                "TRAP_SPIKE" => self.play_tone_ramp("triangle", 120.0, 380.0, 0.35, 0.16, 0.0),
                "TRAP_FROST" => self.play_tone_ramp("sine", 880.0, 320.0, 0.30, 0.25, 0.0),
                _ => self.play_tone_ramp("sawtooth", 620.0, 240.0, 0.28, 0.18, 0.0),
            }
        }
    }

    pub fn play_enemy_death(&mut self, tier: &str) {
        self.record("ENEMY_DEATH", Some(tier.to_string()));
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if tier == "NORMAL" && self.should_throttle("enemy_death_normal", 55.0) {
            return;
        }
        if tier == "ELITE" && self.should_throttle("enemy_death_elite", 100.0) {
            return;
        }
        if tier == "BOSS" {
            self.play_explosion("LARGE");
            #[cfg(target_arch = "wasm32")]
            self.play_tone_ramp("sawtooth", 220.0, 55.0, 0.40, 0.60, 0.0);
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            let is_elite = tier == "ELITE";
            self.play_tone_ramp(
                if is_elite { "triangle" } else { "sine" },
                if is_elite { 320.0 } else { 260.0 },
                70.0,
                if is_elite { 0.32 } else { 0.22 },
                0.16,
                0.0,
            );
        }
    }

    pub fn play_soldier_death(&mut self) {
        self.record("SOLDIER_DEATH", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle("soldier_death", 120.0) {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        self.play_tone_ramp("sawtooth", 200.0, 60.0, 0.26, 0.26, 0.0);
    }

    pub fn play_tower_damaged(&mut self, severity: &str) {
        self.record("TOWER_DAMAGED", Some(severity.to_string()));
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle(&format!("tower_{}", severity), 100.0) {
            return;
        }
        if severity == "DESTROYED" {
            self.play_explosion("LARGE");
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            if severity == "DISABLED" {
                self.play_tone_ramp("sawtooth", 440.0, 110.0, 0.30, 0.26, 0.0);
            } else {
                self.play_tone_ramp("triangle", 280.0, 90.0, 0.35, 0.32, 0.0);
            }
        }
    }

    pub fn play_base_damaged(&mut self, is_boss: bool) {
        self.record("BASE_DAMAGED", Some(is_boss.to_string()));
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle("base_damaged", 150.0) {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        self.play_tone_ramp(
            "square",
            if is_boss { 160.0 } else { 220.0 },
            if is_boss { 110.0 } else { 180.0 },
            0.35,
            0.28,
            0.0,
        );
    }

    pub fn play_enemy_skill(&mut self, skill: &str) {
        self.record("ENEMY_SKILL", Some(skill.to_string()));
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle(&format!("skill_{}", skill), 100.0) {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            match skill {
                "SUMMON" => self.play_tone_ramp("sawtooth", 260.0, 780.0, 0.24, 0.22, 0.0),
                "SPLIT" => self.play_tone_ramp("sawtooth", 420.0, 200.0, 0.24, 0.18, 0.0),
                _ => self.play_tone_ramp("sawtooth", 350.0, 620.0, 0.24, 0.15, 0.0),
            }
        }
    }

    pub fn play_build(&mut self) {
        self.record("BUILD", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        self.play_tone_ramp("triangle", 220.0, 480.0, 0.30, 0.10, 0.0);
    }

    pub fn play_upgrade(&mut self) {
        self.record("UPGRADE", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            for (idx, &f) in [440.0, 554.0, 659.0].iter().enumerate() {
                self.play_tone_ramp("sine", f, f, 0.22, 0.16, idx as f64 * 0.06);
            }
        }
    }

    pub fn play_imbue(&mut self) {
        self.record("IMBUE", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        self.play_tone_ramp("sine", 520.0, 920.0, 0.28, 0.22, 0.0);
    }

    pub fn play_sell(&mut self) {
        self.record("SELL", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            self.play_tone_ramp("sine", 880.0, 880.0, 0.24, 0.12, 0.0);
            self.play_tone_ramp("sine", 1175.0, 1175.0, 0.24, 0.12, 0.07);
        }
    }

    pub fn play_rally(&mut self) {
        self.record("RALLY", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        self.play_tone_ramp("triangle", 330.0, 440.0, 0.25, 0.20, 0.0);
    }

    pub fn play_error(&mut self) {
        self.record("ERROR", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle("ui_error", 120.0) {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        self.play_tone_ramp("square", 140.0, 110.0, 0.18, 0.16, 0.0);
    }

    pub fn play_wave_start(&mut self) {
        self.record("WAVE_START", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        self.play_tone_ramp("sawtooth", 220.0, 330.0, 0.30, 0.38, 0.0);
    }

    pub fn play_wave_complete(&mut self) {
        self.record("WAVE_COMPLETE", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            for (idx, &f) in [523.25, 659.25, 783.99].iter().enumerate() {
                self.play_tone_ramp("sine", f, f, 0.24, 0.25, idx as f64 * 0.08);
            }
        }
    }

    pub fn play_victory(&mut self) {
        self.record("VICTORY", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            for &(f, t, d) in &[
                (523.25, 0.0, 0.16),
                (659.25, 0.16, 0.16),
                (783.99, 0.32, 0.20),
                (1046.5, 0.52, 0.50),
            ] {
                self.play_tone_ramp("triangle", f, f, 0.32, d, t);
            }
        }
    }

    pub fn play_game_over(&mut self) {
        self.record("GAME_OVER", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        {
            for &(f, t, d) in &[
                (330.0, 0.0, 0.22),
                (293.0, 0.22, 0.22),
                (261.0, 0.44, 0.24),
                (196.0, 0.68, 0.60),
            ] {
                self.play_tone_ramp("sawtooth", f, f, 0.30, d, t);
            }
        }
    }

    pub fn play_ui_click(&mut self) {
        self.record("UI_CLICK", None);
        if !self.sound_enabled || self.sound_volume <= 0.0 {
            return;
        }
        if self.should_throttle("ui_click", 50.0) {
            return;
        }
        self.init();
        #[cfg(target_arch = "wasm32")]
        self.play_tone_ramp("sine", 800.0, 400.0, 0.15, 0.04, 0.0);
    }
}
